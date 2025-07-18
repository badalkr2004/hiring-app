import { Router } from "express";
import { body, param, query } from "express-validator";
import { validate } from "@/middleware/validation";
import { authenticate, authorize } from "@/middleware/auth";
import { UserRole } from "@prisma/client";
import {
  getCompanies,
  getCompanyById,
  updateCompany,
  updateCompanybyAdmin,
} from "@/controllers/companyController";

const router = Router();

// Get all companies (public)
router.get(
  "/",
  [
    validate([
      query("page").optional().isInt({ min: 1 }),
      query("limit").optional().isInt({ min: 1, max: 50 }),
      query("search").optional().trim(),
      query("industry").optional().trim(),
      query("verified").optional().isBoolean(),
    ]),
  ],
  getCompanies
);

// Get company by ID (public)
router.get("/:id", getCompanyById);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    param("id").isMongoId().withMessage("Invalid company ID"),
    body("name").optional().trim().isLength({ min: 1 }),
    body("description").optional().trim(),
    body("website").optional().trim().isURL(),
    body("size").optional().trim(),
    body("industry").optional().trim(),
    body("location").optional().trim(),
    body("foundedYear").optional().isString().trim(),
    body("website").optional().isURL(),
  ]),
  updateCompanybyAdmin
);

// Update company profile
router.put(
  "/profile",
  [
    authenticate,
    authorize(UserRole.COMPANY),
    validate([
      body("name").optional().trim().isLength({ min: 1 }),
      body("description").optional().trim(),
      body("website").optional().trim().isURL(),
      body("size").optional().trim(),
      body("industry").optional().trim(),
      body("location").optional().trim(),
      body("foundedYear")
        .optional()
        .isInt({ min: 1800, max: new Date().getFullYear() }),
      body("website").optional().isURL(),
    ]),
  ],
  updateCompany
);

export default router;
