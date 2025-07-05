import { Router } from "express";
import { body } from "express-validator";
import { validate } from "@/middleware/validation";
import { authenticate } from "@/middleware/auth";
import {
  updateProfile,
  uploadAvatar,
  uploadResume,
} from "@/controllers/userController";

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
    ]),
  ],
  updateProfile
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
