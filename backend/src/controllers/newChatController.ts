import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pusher } from "@/config/pusher";

const prisma = new PrismaClient();

// POST /chats/:applicationId
export const createOrGetChat = async (req: Request, res: Response) => {
  const { applicationId } = req.params;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      user: true,
      job: { include: { company: { include: { user: true } } } },
    },
  });

  if (!app)
    return res.status(404).json({ success: false, message: "Not found" });

  const seekerId = app.user.id;
  const employerId = app.job.company.user.id;

  // Does a DIRECT chat already exist?
  let chat = await prisma.chat.findFirst({
    where: {
      type: "DIRECT",
      participants: {
        every: { userId: { in: [seekerId, employerId] } },
      },
    },
    include: { participants: true },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        type: "DIRECT",
        participants: {
          createMany: {
            data: [
              { userId: seekerId, role: "MEMBER" },
              { userId: employerId, role: "MEMBER" },
            ],
          },
        },
      },
      include: { participants: true },
    });
  }

  return res.json({ success: true, data: chat });
};

// GET /chats
export const getMyChats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const chats = await prisma.chat.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: {
        where: { NOT: { userId } },
        select: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return res.json({ success: true, data: chats });
};
