import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { errorHandler } from "@/middleware/errorHandler";
import { notFound } from "@/middleware/notFound";
import logger from "@/utils/logger";
import { connectDB } from "@/config/database";

// Routes
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/users";
import companyRoutes from "@/routes/companies";
import jobRoutes from "@/routes/jobs";
import applicationRoutes from "@/routes/applications";
import adminRoutes from "@/routes/admin";
import communityRoutes from "@/routes/commnunityRoutes";

import chatRoutes from "@/routes/newChat";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
//   message: {
//     error: "Too many requests from this IP, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.options("*", cors());
// app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/communities", communityRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/connects", communityRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

export default app;
