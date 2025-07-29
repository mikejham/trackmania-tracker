import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.DATABASE_URL ||
      "mongodb://mongodb-dev:27017/trackmania-scoreboard-dev";

    await mongoose.connect(mongoUri);

    logger.info("✅ MongoDB connected successfully", {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    });

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      logger.error("❌ MongoDB connection error", { error: error.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB reconnected");
    });
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB", {
      error: (error as Error).message,
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
