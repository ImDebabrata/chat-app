// src/index.ts
import express, { Request, Response } from "express";
import { indexRouter } from "./router/index.router";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket";

// Load environment variables from .env file (if any)
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const server = createServer(app);

// Enable CORS for localhost:4001
app.use(
  cors({
    origin: '*', // Allow requests from frontend running on port 4001
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests

// Socket.io setup
initializeSocket(server, app);

// Define a basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

//Routes
app.use("/", indexRouter);

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
