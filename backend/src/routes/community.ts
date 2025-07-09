import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
  getCommunityChats,
  createCommunityChat,
  searchCommunities,
  getUserCommunities,
  inviteMembers,
  handleInviteResponse,
} from "../controllers/communityController";
import { upload } from "../middleware/upload";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Community CRUD operations
router.post(
  "/",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createCommunity
);
router.get("/", getCommunities);
router.get("/search", searchCommunities);
router.get("/my-communities", getUserCommunities);
router.get("/:communityId", getCommunityById);
router.put(
  "/:communityId",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateCommunity
);
router.delete("/:communityId", deleteCommunity);

// Community membership
router.post("/:communityId/join", joinCommunity);
router.post("/:communityId/leave", leaveCommunity);
router.get("/:communityId/members", getCommunityMembers);
router.patch("/:communityId/members/:userId/role", updateMemberRole);
router.delete("/:communityId/members/:userId", removeMember);

// Community invitations
router.post("/:communityId/invite", inviteMembers);
router.post("/invites/:inviteId/respond", handleInviteResponse);

// Community chats
router.get("/:communityId/chats", getCommunityChats);
router.post("/:communityId/chats", createCommunityChat);

export default router;
