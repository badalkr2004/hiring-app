import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pusher } from "../config/pusher";
import { AuthRequest } from "@/middleware/auth";
import { ApiError } from "@/utils/ApiError";

const prisma = new PrismaClient();

export const createCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      type = "PUBLIC",
      category,
      rules = [],
    } = req.body;
    const userId = req.user!.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const communityData: any = {
      name,
      description,
      type,
      category,
      rules: Array.isArray(rules) ? rules : [rules].filter(Boolean),
      creatorId: userId,
      memberCount: 1,
    };

    if (files?.avatar?.[0]) {
      communityData.avatar = files.avatar[0].path;
    }

    if (files?.banner?.[0]) {
      communityData.banner = files.banner[0].path;
    }

    const community = await prisma.community.create({
      data: {
        ...communityData,
        members: {
          create: {
            userId,
            role: "CREATOR",
          },
        },
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    // Create default general chat for the community
    await prisma.chat.create({
      data: {
        type: "COMMUNITY",
        name: "General",
        communityId: community.id,
        participants: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
    });

    res.status(201).json(community);
  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({ error: "Failed to create community" });
  }
};

export const getCommunities = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category, type, search } = req.query;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const communities = await prisma.community.findMany({
      where,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.community.count({ where });

    res.json({
      communities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get communities error:", error);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
};

export const getCommunityById = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        members: {
          where: { isActive: true },
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
          take: 10,
        },
        _count: {
          select: { members: true, chats: true },
        },
      },
    });

    if (!community) {
      throw new ApiError("Community not found", 404);
    }

    // Check if user is a member
    const userMembership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    res.json({
      ...community,
      userMembership,
    });
  } catch (error) {
    console.error("Get community by ID error:", error);
    res.status(500).json({ error: "Failed to fetch community" });
  }
};

export const updateCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const { name, description, type, category, rules } = req.body;
    const userId = req.user!.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Check if user has permission to update
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!member || !["CREATOR", "ADMIN"].includes(member.role)) {
      throw new ApiError("Insufficient permissions", 403);
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (rules)
      updateData.rules = Array.isArray(rules) ? rules : [rules].filter(Boolean);

    if (files?.avatar?.[0]) {
      updateData.avatar = files.avatar[0].path;
    }

    if (files?.banner?.[0]) {
      updateData.banner = files.banner[0].path;
    }

    const community = await prisma.community.update({
      where: { id: communityId },
      data: updateData,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    // Notify community members
    await pusher.trigger(`community-${communityId}`, "community-updated", {
      community,
      updatedBy: userId,
    });

    res.json(community);
  } catch (error) {
    console.error("Update community error:", error);
    res.status(500).json({ error: "Failed to update community" });
  }
};

export const deleteCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;

    // Check if user is the creator
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.creatorId !== userId) {
      throw new ApiError("Only the creator can delete the community", 403);
    }

    await prisma.community.update({
      where: { id: communityId },
      data: { isActive: false },
    });

    // Notify community members
    await pusher.trigger(`community-${communityId}`, "community-deleted", {
      communityId,
      deletedBy: userId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete community error:", error);
    res.status(500).json({ error: "Failed to delete community" });
  }
};

export const joinCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || !community.isActive) {
      throw new ApiError("Community not found", 404);
    }

    if (community.type === "PRIVATE" || community.type === "INVITE_ONLY") {
      throw new ApiError("This community requires an invitation", 403);
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new ApiError("Already a member", 400);
      } else {
        // Reactivate membership
        await prisma.communityMember.update({
          where: { id: existingMember.id },
          data: { isActive: true, joinedAt: new Date() },
        });
      }
    } else {
      // Create new membership
      await prisma.communityMember.create({
        data: {
          userId,
          communityId,
          role: "MEMBER",
        },
      });
    }

    // Update member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: {
          increment: 1,
        },
      },
    });

    // Add user to all community chats
    const communityChats = await prisma.chat.findMany({
      where: { communityId },
    });

    for (const chat of communityChats) {
      await prisma.chatParticipant.upsert({
        where: {
          userId_chatId: { userId, chatId: chat.id },
        },
        create: {
          userId,
          chatId: chat.id,
          role: "MEMBER",
        },
        update: {
          isActive: true,
        },
      });
    }

    // Get user info for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    // Notify community members
    await pusher.trigger(`community-${communityId}`, "member-joined", {
      user,
      communityId,
    });

    res.json({ success: true, message: "Successfully joined community" });
  } catch (error) {
    console.error("Join community error:", error);
    res.status(500).json({ error: "Failed to join community" });
  }
};

export const leaveCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;

    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!member || !member.isActive) {
      throw new ApiError("Not a member of this community", 400);
    }

    if (member.role === "CREATOR") {
      throw new ApiError(
        "Creator cannot leave the community. Transfer ownership or delete the community.",
        400
      );
    }

    // Deactivate membership
    await prisma.communityMember.update({
      where: { id: member.id },
      data: { isActive: false },
    });

    // Update member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: {
          decrement: 1,
        },
      },
    });

    // Remove from community chats
    await prisma.chatParticipant.updateMany({
      where: {
        userId,
        chat: { communityId },
      },
      data: { isActive: false },
    });

    // Get user info for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    // Notify community members
    await pusher.trigger(`community-${communityId}`, "member-left", {
      user,
      communityId,
    });

    res.json({ success: true, message: "Successfully left community" });
  } catch (error) {
    console.error("Leave community error:", error);
    res.status(500).json({ error: "Failed to leave community" });
  }
};

export const getCommunityMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 50, role, search } = req.query;
    const userId = req.user!.id;

    // Check if user is a member
    const userMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!userMember || !userMember.isActive) {
      throw new ApiError("Access denied", 403);
    }

    const where: any = {
      communityId,
      isActive: true,
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search as string, mode: "insensitive" } },
          { lastName: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ],
      };
    }

    const members = await prisma.communityMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            lastLogin: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.communityMember.count({ where });

    res.json({
      members,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get community members error:", error);
    res.status(500).json({ error: "Failed to fetch community members" });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const { role } = req.body;
    const userId = req.user!.id;

    // Check if user has permission to update roles
    const userMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!userMember || !["CREATOR", "ADMIN"].includes(userMember.role)) {
      throw new ApiError("Insufficient permissions", 403);
    }

    // Cannot change creator role
    if (role === "CREATOR") {
      throw new ApiError("Cannot assign creator role", 400);
    }

    const targetMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId: targetUserId, communityId },
      },
    });

    if (!targetMember || targetMember.role === "CREATOR") {
      throw new ApiError("Cannot update this member's role", 400);
    }
    const updatedMember = await prisma.communityMember.update({
      where: { id: targetMember.id },
      data: { role },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Update chat participant roles if needed
    if (role === "ADMIN" || role === "MODERATOR") {
      await prisma.chatParticipant.updateMany({
        where: {
          userId: targetUserId,
          chat: { communityId },
        },
        data: { role: role === "ADMIN" ? "ADMIN" : "MODERATOR" },
      });
    }

    // Notify community
    await pusher.trigger(`community-${communityId}`, "member-role-updated", {
      member: updatedMember,
      updatedBy: userId,
    });

    res.json(updatedMember);
  } catch (error) {
    console.error("Update member role error:", error);
    res.status(500).json({ error: "Failed to update member role" });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const userId = req.user!.id;

    // Check permissions
    const userMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!userMember || !["CREATOR", "ADMIN"].includes(userMember.role)) {
      throw new ApiError("Insufficient permissions", 403);
    }

    const targetMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId: targetUserId, communityId },
      },
    });

    if (!targetMember || targetMember.role === "CREATOR") {
      throw new ApiError("Cannot remove this member", 400);
    }

    // Remove member
    await prisma.communityMember.update({
      where: { id: targetMember.id },
      data: { isActive: false },
    });

    // Update member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: { decrement: 1 },
      },
    });

    // Remove from community chats
    await prisma.chatParticipant.updateMany({
      where: {
        userId: targetUserId,
        chat: { communityId },
      },
      data: { isActive: false },
    });

    // Get user info for notification
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    // Notify community
    await pusher.trigger(`community-${communityId}`, "member-removed", {
      user: targetUser,
      removedBy: userId,
      communityId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

export const getCommunityChats = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;

    // Check if user is a member
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!member || !member.isActive) {
      throw new ApiError("Access denied", 403);
    }

    const chats = await prisma.chat.findMany({
      where: {
        communityId,
        participants: {
          some: { userId, isActive: true },
        },
      },
      include: {
        participants: {
          where: { isActive: true },
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
          select: { messages: true, participants: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(chats);
  } catch (error) {
    console.error("Get community chats error:", error);
    res.status(500).json({ error: "Failed to fetch community chats" });
  }
};

export const createCommunityChat = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const { name, avatar } = req.body;
    const userId = req.user!.id;

    // Check if user has permission to create chats
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!member || !["CREATOR", "ADMIN", "MODERATOR"].includes(member.role)) {
      throw new ApiError("Insufficient permissions", 403);
    }

    // Get all community members
    const communityMembers = await prisma.communityMember.findMany({
      where: { communityId, isActive: true },
      select: { userId: true, role: true },
    });

    const chat = await prisma.chat.create({
      data: {
        type: "COMMUNITY",
        name,
        avatar,
        communityId,
        participants: {
          create: communityMembers.map((member) => ({
            userId: member.userId,
            role: ["CREATOR", "ADMIN"].includes(member.role)
              ? "ADMIN"
              : member.role === "MODERATOR"
              ? "MODERATOR"
              : "MEMBER",
          })),
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

    // Notify community members
    await pusher.trigger(`community-${communityId}`, "chat-created", {
      chat,
      createdBy: userId,
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Create community chat error:", error);
    res.status(500).json({ error: "Failed to create community chat" });
  }
};

export const searchCommunities = async (req: AuthRequest, res: Response) => {
  try {
    const { q, category, type, page = 1, limit = 20 } = req.query;

    if (!q) {
      throw new ApiError("Search query is required", 400);
    }

    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: q as string, mode: "insensitive" } },
        { description: { contains: q as string, mode: "insensitive" } },
        { category: { contains: q as string, mode: "insensitive" } },
      ],
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    const communities = await prisma.community.findMany({
      where,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.community.count({ where });

    res.json({
      communities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Search communities error:", error);
    res.status(500).json({ error: "Failed to search communities" });
  }
};

export const getUserCommunities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const memberships = await prisma.communityMember.findMany({
      where: { userId, isActive: true },
      include: {
        community: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const communities = memberships.map((membership) => ({
      ...membership.community,
      userRole: membership.role,
      joinedAt: membership.joinedAt,
    }));

    res.json({ communities });
  } catch (error) {
    console.error("Get user communities error:", error);
    res.status(500).json({ error: "Failed to fetch user communities" });
  }
};

export const inviteMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.params;
    const { userIds, message } = req.body;
    const userId = req.user!.id;

    // Check permissions
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (!member || !["CREATOR", "ADMIN", "MODERATOR"].includes(member.role)) {
      throw new ApiError("Insufficient permissions", 403);
    }

    // Create invitations (you'll need to add an Invitation model)
    // For now, we'll just add them directly if the community allows it
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new ApiError("Community not found", 404);
    }

    // Add members directly for PUBLIC communities
    if (community.type === "PUBLIC") {
      const newMembers = await prisma.communityMember.createMany({
        data: userIds.map((id: string) => ({
          userId: id,
          communityId,
          role: "MEMBER",
        })),
      });
      // Update member count
      await prisma.community.update({
        where: { id: communityId },
        data: {
          memberCount: { increment: newMembers.count },
        },
      });

      res.json({ success: true, invited: newMembers.count });
    } else {
      // For PRIVATE/INVITE_ONLY communities, you'd create invitation records
      // and send notifications
      res.json({ success: true, message: "Invitations sent" });
    }
  } catch (error) {
    console.error("Invite members error:", error);
    res.status(500).json({ error: "Failed to invite members" });
  }
};

export const handleInviteResponse = async (req: AuthRequest, res: Response) => {
  try {
    // This would handle invitation acceptance/rejection
    // Implementation depends on your invitation system
    res.json({ success: true });
  } catch (error) {
    console.error("Handle invite response error:", error);
    res.status(500).json({ error: "Failed to handle invitation response" });
  }
};
