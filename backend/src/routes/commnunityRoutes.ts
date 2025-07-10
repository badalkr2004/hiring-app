import { Router } from "express";
import {
  getCommunities,
  createCommunity,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getMyCommunities,
} from "@/controllers/communityController";
import { authenticate } from "@/middleware/auth";

const router = Router();

// Community routes
router.get("/communities", getCommunities);
router.post("/communities", authenticate, createCommunity);
router.get("/communities/:id", authenticate, getCommunityById);
router.post("/communities/:id/join", authenticate, joinCommunity);
router.post("/communities/:id/leave", authenticate, leaveCommunity);
router.get("/communities/:id/members", authenticate, getCommunityMembers);
router.get("/my-communities", authenticate, getMyCommunities);

export default router;
