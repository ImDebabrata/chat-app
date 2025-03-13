import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function initializeSocket(
  server: http.Server,
  app: express.Application
) {
  const io = new Server(server, {
    cors: {
      origin: process.env.APP_URL || "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Get conversation history
    socket.on("getConversation", async (data: { senderId: string; receiverId: string }, callback) => {
      try {
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { 
                senderId: data.senderId,
                receiverId: data.receiverId 
              },
              { 
                senderId: data.receiverId,
                receiverId: data.senderId 
              }
            ]
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
        
        callback({ success: true, data: messages });
      } catch (error) {
        console.error("Error fetching conversation:", error);
        callback({ success: false, error: "Failed to fetch conversation" });
      }
    });

    // Listen for chat messages
    socket.on("chatMessage", async (data: { senderId: string; receiverId: string; content: string }, callback) => {
      try {
        // Store message in database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            receiverId: data.receiverId
          }
        });
        
        // Broadcast the message to all clients
        io.emit("chatMessage", message);
        
        // Return success with the created message for acknowledgment
        if (callback) callback({ success: true, ...message });
      } catch (error) {
        console.error("Error saving message:", error);
        if (callback) callback({ success: false, error: "Failed to save message" });
      }
    });

    // Listen for status update (online/offline)
    socket.on("updateStatus", async (data: { userId: string; status: string }) => {
      try {
        // Update user status in database
        await prisma.user.update({
          where: { id: data.userId },
          data: { status: data.status }
        });
        
        // Broadcast status update
        io.emit("updateStatus", data);
      } catch (error) {
        console.error("Error updating status:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // If you have the user ID stored in socket, you can update their status to offline
      const userId = socket.data?.userId;
      if (userId) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { status: "offline" }
          });
          
          io.emit("updateStatus", { userId, status: "offline" });
        } catch (error) {
          console.error("Error updating status on disconnect:", error);
        }
      }
    });
  });
}
