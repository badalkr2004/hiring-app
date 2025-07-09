import { Router } from "express";
import { createOrGetChat, getMyChats } from "@/controllers/newChatController";
import { getMessages, sendMessage } from "@/controllers/messageController";
import { authenticate, AuthRequest } from "@/middleware/auth";
import { pusher } from "@/config/pusher";

const router = Router();

router.use(authenticate);

// pusher presence auth
router.post("/pusher/auth", (req: AuthRequest, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const auth = pusher.authenticate(socketId, channel, {
    user_id: (req as any).user.id,
  });
  res.send(auth);
});

// chat routes
router.get("/chats", getMyChats);
router.post("/chats/:applicationId", createOrGetChat);

router.get("/chats/:chatId/messages", getMessages);
router.post("/chats/:chatId/messages", sendMessage);

export default router;
