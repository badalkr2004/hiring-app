import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pusher } from "../config/pusher";
import { AuthRequest } from "@/middleware/auth";
import { ApiError } from "@/utils/ApiError";

const prisma = new PrismaClient();

export const createDirectChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = req.user!.id;

    if (userId === participantId) {
      throw new ApiError("Cannot create chat with yourself", 400);
    }
    // Check if direct chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: "DIRECT",
        participants: {
          every: {
            userId: { in: [userId, participantId] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      res.json(existingChat);
    }

    // Create new direct chat
    const chat = await prisma.chat.create({
      data: {
        type: "DIRECT",
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Create direct chat error:", error);
    throw new ApiError("Failed to create chat", 500);
  }
};

export const getUserChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId, isActive: true },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json(chats);
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: { userId, chatId },
      },
    });

    if (!participant) {
      throw new ApiError("Access denied", 403);
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { content, type = "TEXT" } = req.body;
    const userId = req.user!.id;
    const file = req.file;

    // Verify user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: { userId, chatId },
      },
    });

    if (!participant) {
      throw new ApiError("Access denied", 403);
    }
    const messageData: any = {
      content: content || "",
      type,
      senderId: userId,
      chatId,
    };

    if (file) {
      messageData.fileUrl = file.path; // Cloudinary URL
      messageData.fileName = file.originalname;

      // Determine message type based on file
      if (file.mimetype.startsWith("image/")) {
        messageData.type = "IMAGE";
      } else {
        messageData.type = "FILE";
      }
    }

    const message = await prisma.message.create({
      data: messageData,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Send real-time notification via Pusher
    await pusher.trigger(`chat-${chatId}`, "new-message", message);

    // Notify other participants
    const otherParticipants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
        userId: { not: userId },
        isActive: true,
      },
      select: { userId: true },
    });

    for (const participant of otherParticipants) {
      await pusher.trigger(
        `user-${participant.userId}`,
        "new-message-notification",
        {
          chatId,
          message,
          sender: message.sender,
        }
      );
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    await prisma.chatParticipant.update({
      where: {
        userId_chatId: { userId, chatId },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Notify other participants about read status
    await pusher.trigger(`chat-${chatId}`, "messages-read", {
      userId,
      readAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new ApiError("Access denied", 403);
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Send real-time update
    await pusher.trigger(
      `chat-${message.chatId}`,
      "message-edited",
      updatedMessage
    );

    res.json(updatedMessage);
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ error: "Failed to edit message" });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new ApiError("Access denied", 403);
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    // Send real-time update
    await pusher.trigger(`chat-${message.chatId}`, "message-deleted", {
      messageId,
      chatId: message.chatId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

export const getChatParticipants = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    const userParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: { userId, chatId },
      },
    });

    if (!userParticipant) {
      throw new ApiError("Access denied", 403);
    }

    const participants = await prisma.chatParticipant.findMany({
      where: { chatId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            lastLogin: true,
          },
        },
      },
    });

    res.json(participants);
  } catch (error) {
    console.error("Get chat participants error:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
};

export const addParticipants = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { userIds } = req.body;
    const userId = req.user!.id;

    // Verify user has admin/moderator role
    const userParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: { userId, chatId },
      },
    });

    if (
      !userParticipant ||
      !["ADMIN", "MODERATOR"].includes(userParticipant.role)
    ) {
      throw new ApiError("Insufficient permissions", 403);
    }

    const newParticipants = await prisma.chatParticipant.createMany({
      data: userIds.map((id: string) => ({
        userId: id,
        chatId,
      })),
    });

    // Send real-time update
    await pusher.trigger(`chat-${chatId}`, "participants-added", {
      userIds,
      addedBy: userId,
    });

    res.json({ success: true, added: newParticipants.count });
  } catch (error) {
    console.error("Add participants error:", error);
    res.status(500).json({ error: "Failed to add participants" });
  }
};

export const removeParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, userId: targetUserId } = req.params;
    const userId = req.user!.id;

    // Verify user has admin/moderator role or is removing themselves
    const userParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: { userId, chatId },
      },
    });

    if (
      !userParticipant ||
      (userId !== targetUserId &&
        !["ADMIN", "MODERATOR"].includes(userParticipant.role))
    ) {
      throw new ApiError("Insufficient permissions", 403);
    }

    await prisma.chatParticipant.update({
      where: {
        userId_chatId: { userId: targetUserId, chatId },
      },
      data: { isActive: false },
    });

    // Send real-time update
    await pusher.trigger(`chat-${chatId}`, "participant-removed", {
      userId: targetUserId,
      removedBy: userId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Remove participant error:", error);
    res.status(500).json({ error: "Failed to remove participant" });
  }
};

export const updateChatSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { name, avatar } = req.body;
    const userId = req.user!.id;

    // Verify user has admin role
    const userParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: { userId, chatId },
      },
    });

    if (!userParticipant || userParticipant.role !== "ADMIN") {
      throw new ApiError("Admin access required", 403);
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { name, avatar },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Send real-time update
    await pusher.trigger(`chat-${chatId}`, "chat-updated", updatedChat);

    res.json(updatedChat);
  } catch (error) {
    console.error("Update chat settings error:", error);
    res.status(500).json({ error: "Failed to update chat settings" });
  }
};
