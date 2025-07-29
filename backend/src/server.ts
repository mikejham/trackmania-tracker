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
import mongoose from "mongoose";

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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173", // Vite dev server
        "http://localhost:3000", // Production frontend
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://trackmania-tracker-frontend.onrender.com", // Production frontend on Render
        "https://trackmania-tracker.onrender.com", // Backend domain (for testing)
        "https://trackmania-times.com", // Custom domain
        "https://www.trackmania-times.com", // Custom domain with www
      ];

      // Allow any Render subdomain
      if (origin.includes(".onrender.com")) {
        return callback(null, true);
      }

      // Allow custom domain
      if (origin.includes("trackmania-times.com")) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
    environment: process.env.NODE_ENV || "development",
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
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
};

// Comprehensive error monitoring
process.on("uncaughtException", (error) => {
  logger.error("💥 Uncaught Exception - Application will exit", {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("💥 Unhandled Rejection", {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString(),
  });
});

// Memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  const rssMB = Math.round(memUsage.rss / 1024 / 1024);
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

  logger.info("📊 Memory usage", {
    rss: rssMB + " MB",
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
    heapUsed: heapUsedMB + " MB",
    external: Math.round(memUsage.external / 1024 / 1024) + " MB",
  });

  // Alert if memory usage is getting high
  if (rssMB > 400) {
    logger.warn("⚠️ High memory usage detected", {
      rss: rssMB + " MB",
      heapUsed: heapUsedMB + " MB",
    });
  }

  // Alert if heap usage is growing rapidly
  if (heapUsedMB > 200) {
    logger.warn("⚠️ High heap usage detected", {
      heapUsed: heapUsedMB + " MB",
    });
  }
}, 600000); // Every 10 minutes (was 5 minutes)

// Keep-alive ping to prevent Render free tier from spinning down
setInterval(() => {
  logger.info("💓 Keep-alive ping", {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}, 300000); // Every 5 minutes (was 1 minute)

// Process monitoring
setInterval(() => {
  logger.info("🔍 Process health check", {
    uptime: process.uptime(),
    memoryUsage: Math.round(process.memoryUsage().rss / 1024 / 1024) + " MB",
    cpuUsage: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  });
}, 600000); // Every 10 minutes (was 5 minutes)

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("🛑 SIGTERM received, shutting down gracefully", {
    timestamp: new Date().toISOString(),
  });
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("🛑 SIGINT received, shutting down gracefully", {
    timestamp: new Date().toISOString(),
  });
  process.exit(0);
});

startServer();
