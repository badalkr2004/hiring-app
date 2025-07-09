import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createDirectChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  getChatParticipants,
  addParticipants,
  removeParticipant,
  updateChatSettings,
} from "@/controllers/chatController";
import { upload } from "../middleware/upload";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Chat management
router.post("/direct", createDirectChat);
router.get("/", getUserChats);
router.get("/:chatId", getChatMessages);
router.get("/:chatId/participants", getChatParticipants);

// Message operations
router.post("/:chatId/messages", upload.single("file"), sendMessage);
router.put("/messages/:messageId", editMessage);
router.delete("/messages/:messageId", deleteMessage);
router.patch("/:chatId/read", markMessagesAsRead);

// Group chat management
router.post("/:chatId/participants", addParticipants);
router.delete("/:chatId/participants/:userId", removeParticipant);
router.patch("/:chatId/settings", updateChatSettings);

export default router;
