import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pusher } from "@/config/pusher";
import { ApiError } from "@/utils/ApiError";

const prisma = new PrismaClient();

// GET /communities - Get all communities
export const getCommunities = async (req: Request, res: Response) => {
  try {
    const { category, type, search } = req.query;

    const where: any = {
      isActive: true,
    };

    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const communities = await prisma.community.findMany({
      where,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        members: {
          select: {
            id: true,
            role: true,
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
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch communities" });
  }
};

// POST /communities - Create community
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { name, description, category, type, rules, avatar, banner } =
      req.body;
    const userId = (req as any).user.id;

    const community = await prisma.community.create({
      data: {
        name,
        description,
        category,
        type: type || "PUBLIC",
        rules: rules || [],
        avatar,
        banner,
        creatorId: userId,
        memberCount: 1,
        members: {
          create: {
            userId,
            role: "CREATOR",
          },
        },
        chats: {
          create: {
            type: "COMMUNITY",
            name: `${name} General`,
            participants: {
              create: {
                userId,
                role: "ADMIN",
              },
            },
          },
        },
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        members: {
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
        chats: true,
      },
    });

    res.json({ success: true, data: community });
  } catch (error) {
    console.error("Error creating community:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create community" });
  }
};

// GET /communities/:id - Get community details
export const getCommunityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        members: {
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
          orderBy: { joinedAt: "asc" },
        },
        chats: {
          include: {
            participants: { where: { userId } },
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
    });

    if (!community) {
      throw new ApiError("Community not found", 404);
    }

    const userMember = community.members.find((m) => m.userId === userId);
    const canAccess = community.type === "PUBLIC" || userMember;

    if (!canAccess) {
      throw new ApiError("Access denied", 403);
    }

    res.json({ success: true, data: { ...community, userMember } });
  } catch (error) {
    console.error("Error fetching community:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch community" });
  }
};

// POST /communities/:id/join - Join community
export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true, chats: true },
    });

    if (!community) {
      throw new ApiError("Community not found", 404);
    }
    const existingMember = community.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new ApiError("Already a member", 400);
    }

    if (community.type === "PRIVATE") {
      throw new ApiError("This community is private", 403);
    }

    await prisma.$transaction(async (tx) => {
      // Add user as member
      await tx.communityMember.create({
        data: {
          userId,
          communityId: id,
          role: "MEMBER",
        },
      });

      // Add to community chat
      const communityChat = community.chats.find((c) => c.type === "COMMUNITY");
      if (communityChat) {
        await tx.chatParticipant.create({
          data: {
            userId,
            chatId: communityChat.id,
            role: "MEMBER",
          },
        });
      }

      // Update member count
      await tx.community.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      });
    });

    // Notify community members
    await pusher.trigger(`community-${id}`, "member:joined", {
      userId,
      communityId: id,
    });

    res.json({ success: true, message: "Successfully joined community" });
  } catch (error) {
    console.error("Error joining community:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to join community" });
  }
};

// POST /communities/:id/leave - Leave community
export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const community = await prisma.community.findUnique({
      where: { id },
      include: { members: true, chats: true },
    });

    if (!community) {
      throw new ApiError("Community not found", 404);
    }

    const member = community.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ApiError("Not a member", 400);
    }

    if (member.role === "CREATOR") {
      throw new ApiError("Creator cannot leave community", 400);
    }

    await prisma.$transaction(async (tx) => {
      // Remove from community
      await tx.communityMember.delete({
        where: { id: member.id },
      });

      // Remove from community chats
      const communityChat = community.chats.find((c) => c.type === "COMMUNITY");
      if (communityChat) {
        await tx.chatParticipant.deleteMany({
          where: {
            userId,
            chatId: communityChat.id,
          },
        });
      }

      // Update member count
      await tx.community.update({
        where: { id },
        data: { memberCount: { decrement: 1 } },
      });
    });

    // Notify community members
    await pusher.trigger(`community-${id}`, "member:left", {
      userId,
      communityId: id,
    });

    res.json({ success: true, message: "Successfully left community" });
  } catch (error) {
    console.error("Error leaving community:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to leave community" });
  }
};

// GET /communities/:id/members - Get community members
export const getCommunityMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const members = await prisma.communityMember.findMany({
      where: { communityId: id, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            skills: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    res.json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching members:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch members" });
  }
};

// GET /my-communities - Get user's communities
export const getMyCommunities = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const communities = await prisma.community.findMany({
      where: {
        members: { some: { userId, isActive: true } },
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        members: { where: { userId }, select: { role: true } },
        chats: {
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ success: true, data: communities });
  } catch (error) {
    console.error("Error fetching user communities:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch communities" });
  }
};
