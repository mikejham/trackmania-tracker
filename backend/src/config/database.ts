import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.DATABASE_URL ||
      "mongodb://mongodb-dev:27017/trackmania-scoreboard-dev";

    // Add connection options for better error handling
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);

    logger.info("✅ MongoDB connected successfully", {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    });

    // Handle connection events with more detailed logging
    mongoose.connection.on("error", (error) => {
      logger.error("❌ MongoDB connection error", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected", {
        timestamp: new Date().toISOString(),
        readyState: mongoose.connection.readyState,
      });
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB reconnected", {
        timestamp: new Date().toISOString(),
        readyState: mongoose.connection.readyState,
      });
    });

    mongoose.connection.on("close", () => {
      logger.warn("🔒 MongoDB connection closed", {
        timestamp: new Date().toISOString(),
      });
    });

    // Monitor for connection timeouts
    mongoose.connection.on("timeout", () => {
      logger.error("⏰ MongoDB connection timeout", {
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("✅ MongoDB disconnected successfully");
  } catch (error) {
    logger.error("❌ Error disconnecting from MongoDB", {
      error: (error as Error).message,
    });
  }
};
