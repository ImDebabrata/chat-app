import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
    };

    if (!decoded) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }


    // Fetch user from DB to ensure they exist
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    req.body.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed.",error });
  }
};

export default authMiddleware;
