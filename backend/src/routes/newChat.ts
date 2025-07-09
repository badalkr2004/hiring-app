import { Router } from "express";
import { createOrGetChat, getMyChats } from "@/controllers/newChatController";
import { getMessages, sendMessage } from "@/controllers/messageController";
import { authenticate, AuthRequest } from "@/middleware/auth";
import { pusher } from "@/config/pusher";
import { ApiError } from "@/utils/ApiError";

const router = Router();

// pusher presence auth
router.post("/pusher/auth", authenticate, (req: AuthRequest, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  // Ensure user is authenticated
  if (!req.user?.id) {
    throw new ApiError("unauthrized");
  }

  const auth = pusher.authenticate(socketId, channel, {
    user_id: req.user.id,
  });

  res.send(auth);
});

// chat routes
router.get("/chats", authenticate, getMyChats);
router.post("/chats/:applicationId", authenticate, createOrGetChat);

router.get("/chats/:chatId/messages", authenticate, getMessages);
router.post("/chats/:chatId/messages", authenticate, sendMessage);

export default router;
