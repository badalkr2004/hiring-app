import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pusher } from "@/config/pusher";

const prisma = new PrismaClient();

// GET /chats/:chatId/messages
export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const messages = await prisma.message.findMany({
    where: { chatId },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json({ success: true, data: messages });
};

// POST /chats/:chatId/messages
export const sendMessage = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = (req as any).user.id;

  const message = await prisma.message.create({
    data: { chatId, senderId, content },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  await pusher.trigger(`private-chat-${chatId}`, "message:new", message);

  res.json({ success: true, data: { ...message } });
};
