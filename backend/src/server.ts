import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import passport from "./config/passport";
import { connectDatabase } from "./config/database";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/auth";
import { trackRoutes } from "./routes/tracks";
import { scoreRoutes } from "./routes/scores";
import { logger } from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize passport
app.use(passport.initialize());

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration - MUST come before rate limiting
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Production frontend
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://trackmania-tracker-frontend.onrender.com", // Production frontend on Render
    ],
    credentials: true,
  })
);

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // 1000 requests for dev, 100 for prod
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  skip: (req) => req.method === "OPTIONS",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/scores", scoreRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    logger.error("❌ Failed to start server", {
      error: (error as Error).message,
    });
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

startServer();
