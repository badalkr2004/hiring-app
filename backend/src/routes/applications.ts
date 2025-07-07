import { Router } from "express";
import { body, query, param } from "express-validator";
import { validate } from "@/middleware/validation";
import { authenticate, authorize } from "@/middleware/auth";
import { UserRole } from "@prisma/client";
import {
  applyToJob,
  getUserApplications,
  getCompanyApplications,
  updateApplicationStatus,
  getApplicationById,
  withdrawApplication,
  userApplicationStatus,
  getApplicationByJobId,
} from "@/controllers/applicationController";

const router = Router();

// Apply to job
router.post(
  "/jobs/:jobId/apply",
  [
    authenticate,
    authorize(UserRole.USER),
    validate([
      param("jobId").isMongoId().withMessage("Invalid job ID"),
      body("coverLetter").optional().trim(),
      body("resume").optional().trim(),
    ]),
  ],
  applyToJob
);

// Get user's applications
router.get(
  "/my-applications",
  [
    authenticate,
    authorize(UserRole.USER),
    validate([
      query("page").optional().isInt({ min: 1 }),
      query("limit").optional().isInt({ min: 1, max: 50 }),
      query("status")
        .optional()
        .isIn([
          "PENDING",
          "REVIEWED",
          "SHORTLISTED",
          "REJECTED",
          "HIRED",
          "all",
        ]),
    ]),
  ],
  getUserApplications
);

// user application status
router.get(
  "/applied/status",
  [
    authenticate,
    authorize(UserRole.USER),
    validate([
      query("jobId").optional().isMongoId().withMessage("Invalid job ID"),
    ]),
  ],
  userApplicationStatus
);

// Get company's applications
router.get(
  "/company-applications",
  [
    authenticate,
    authorize(UserRole.COMPANY),
    validate([
      query("page").optional().isInt({ min: 1 }),
      query("limit").optional().isInt({ min: 1, max: 50 }),
      query("status")
        .optional()
        .isIn([
          "PENDING",
          "REVIEWED",
          "SHORTLISTED",
          "REJECTED",
          "HIRED",
          "all",
        ]),
      query("jobId").optional().isMongoId(),
    ]),
  ],
  getCompanyApplications
);

// Update application status
router.patch(
  "/:id/status",
  [
    authenticate,
    authorize(UserRole.COMPANY),
    validate([
      param("id").isMongoId().withMessage("Invalid application ID"),
      body("status").isIn([
        "PENDING",
        "REVIEWED",
        "SHORTLISTED",
        "REJECTED",
        "HIRED",
      ]),
      body("notes").optional().trim(),
    ]),
  ],
  updateApplicationStatus
);

// Get application by ID
router.get(
  "/:id",
  [
    authenticate,
    validate([param("id").isMongoId().withMessage("Invalid application ID")]),
  ],
  getApplicationById
);

//get application by specific job id
router.get(
  "/job/:jobId",
  [
    authenticate,
    validate([param("jobId").isMongoId().withMessage("Invalid job ID")]),
  ],
  getApplicationByJobId
);

// Withdraw application
router.delete(
  "/:id",
  [
    authenticate,
    authorize(UserRole.USER),
    validate([param("id").isMongoId().withMessage("Invalid application ID")]),
  ],
  withdrawApplication
);

export default router;
