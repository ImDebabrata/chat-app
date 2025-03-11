import { Request, Response } from "express";
import prisma from "../utils/prisma";

// Get list of users (excluding the current user)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.body?.user?.id; // Assuming you have user authentication middleware

    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, name: true, email: true, status: true },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.body?.user?.id; // Assuming authentication middleware adds `req.user`

    if (!receiverId || !content) {
    res.status(400).json({ message: "Receiver and message required" });
    return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body?.user; // Assuming user is extracted from authMiddleware
      const { recipientId } = req.params;
  
      if (!recipientId) {
         res.status(400).json({ message: "Recipient ID is required" });
         return
      }
  
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: recipientId },
            { senderId: recipientId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  };
