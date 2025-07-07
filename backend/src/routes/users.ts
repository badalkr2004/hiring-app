import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "@/middleware/validation";
import { authenticate, authorize } from "@/middleware/auth";
import {
  getAllUsers,
  getUserProfile,
  updateProfile,
  updateProfilebyAdmin,
  uploadAvatar,
  uploadResume,
} from "@/controllers/userController";
import { get } from "http";

const router = Router();

// Update profile
router.put(
  "/profile",
  [
    authenticate,
    validate([
      body("firstName").optional().trim().isLength({ min: 1 }),
      body("lastName").optional().trim().isLength({ min: 1 }),
      body("phone").optional().trim(),
      body("location").optional().trim(),
      body("skills").optional().isArray(),
      body("experience").optional().trim(),
      body("bio").optional().trim(),
      body("education").optional().trim(),
      body("linkedIn").optional().trim(),
      body("github").optional().trim(),
      body("portfolio").optional().trim(),
      body("avatar").optional().trim(),
      body("resume").optional().trim(),
    ]),
  ],
  updateProfile
);

// get all users for the admin dashboard
router.get(
  "/all",
  [
    authenticate,
    validate([
      body("page").optional().isInt({ min: 1 }),
      body("limit").optional().isInt({ min: 1, max: 50 }),
      body("search").optional().trim(),
    ]),
  ],
  getAllUsers
);

// update user profile by admin

router.get(
  "/profile/:id",
  authenticate,
  authorize("ADMIN"),
  validate([param("id").isUUID().withMessage("Invalid user ID")]),
  getUserProfile
);
router.put(
  "/profile/:id",
  [
    authenticate,
    authorize("ADMIN"),
    validate([
      body("firstName").optional().trim().isLength({ min: 1 }),
      body("lastName").optional().trim().isLength({ min: 1 }),
      body("phone").optional().trim(),
      body("location").optional().trim(),
      body("skills").optional().isArray(),
      body("experience").optional().trim(),
      body("bio").optional().trim(),
      body("education").optional().trim(),
      body("linkedIn").optional().trim(),
      body("github").optional().trim(),
      body("portfolio").optional().trim(),
    ]),
  ],
  updateProfilebyAdmin
);

// Upload avatar
router.post(
  "/avatar",
  [authenticate, validate([body("url").isURL().withMessage("Invalid URL")])],
  uploadAvatar
);
router.post(
  "/upload-resume",
  [authenticate, validate([body("url").isURL().withMessage("Invalid URL")])],
  uploadResume
);

export default router;
