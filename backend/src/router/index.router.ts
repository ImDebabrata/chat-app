import express from "express";
import {
  signinController,
  signupController,
} from "../controllers/auth.controller";
import authMiddleware from "../middlewares/authMiddleware";
import { getMessages, getUsers, sendMessage } from "../controllers/app.controller";

export const indexRouter = express.Router();

//Auth routes
indexRouter.post("/signin", signinController);
indexRouter.post("/signup", signupController);

// App routes
indexRouter.get("/users", authMiddleware, getUsers);
indexRouter.post("/message", authMiddleware, sendMessage);
indexRouter.get("/messages/:recipientId", authMiddleware, getMessages);

