import { Request, Response } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // For generating authentication token

export const signupController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    console.log({ email, password });

    if (!email || !password || !name) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      res.status(401).json({ message: "Email address already exists" });
      return;
    }

    // Hash the user's password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const generatedUser = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
      },
      select: { id: true, email: true, name: true, createdAt: true }, // Exclude password
    });

    res.status(201).json({
      message: "User created",
      user: generatedUser, // Optionally return created user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const signinController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: "Please enter email and password" });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT Token (optional)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d", // Token valid for 7 days
      }
    );

    // Send response without the password
    res.status(200).json({
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token, // Send token for authentication
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
