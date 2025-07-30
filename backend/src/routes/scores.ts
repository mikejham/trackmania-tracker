import { Router } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";
import passport from "../config/passport";
import { Score } from "../models/Score";
import { User } from "../models/User";

const router = Router();

// Import the weekly challenge track from tracks route
let weeklyChallengeTrackId = "w33-4"; // Default fallback

// Function to update the weekly challenge track ID (called from tracks route)
export const updateWeeklyChallengeTrackId = (trackId: string) => {
  weeklyChallengeTrackId = trackId;
  logger.info(`Weekly challenge track ID updated to: ${trackId}`);
};

// Validation schema for score submission
const submitScoreSchema = z.object({
  trackId: z.string().min(1, "Track ID is required"),
  time: z.number().positive("Time must be a positive number"),
  screenshot: z.string().optional(),
  replay: z.string().optional(),
});

// POST /api/scores/submit - Submit a new score
router.post(
  "/submit",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Validate input
      const validatedData = submitScoreSchema.parse(req.body);
      const user = req.user as any;

      if (!user) {
        logger.warn("Score submission failed - no authenticated user", {
          ip: req.ip,
        });
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Get fresh user data
      const freshUser = await User.findById(user._id || user.id);
      if (!freshUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Map weekly-challenge to actual weekly track ID
      const actualTrackId =
        validatedData.trackId === "weekly-challenge"
          ? weeklyChallengeTrackId
          : validatedData.trackId;

      // Check if user already has a score for this track
      const existingScore = await Score.findOne({
        trackId: actualTrackId,
        userId: user._id || user.id,
      });

      let score;
      if (existingScore) {
        // Update existing score if new time is better
        if (validatedData.time < existingScore.time) {
          existingScore.time = validatedData.time;
          existingScore.screenshot =
            validatedData.screenshot || existingScore.screenshot;
          existingScore.replay = validatedData.replay || existingScore.replay;
          existingScore.updatedAt = new Date();

          await existingScore.save();
          score = existingScore;

          logger.info("Score updated", {
            userId: user._id || user.id,
            username: freshUser.username,
            trackId: actualTrackId,
            oldTime: existingScore.time,
            newTime: validatedData.time,
            ip: req.ip,
          });
        } else {
          // New time is not better, return existing score
          score = existingScore;
          logger.info("Score not updated - new time not better", {
            userId: user._id || user.id,
            username: freshUser.username,
            trackId: actualTrackId,
            existingTime: existingScore.time,
            newTime: validatedData.time,
            ip: req.ip,
          });
        }
      } else {
        // Create new score
        score = new Score({
          trackId: actualTrackId,
          userId: user._id || user.id,
          username: freshUser.username,
          email: freshUser.email,
          time: validatedData.time,
          position: 0, // Will be calculated when leaderboard is fetched
          medal: "None", // Will be calculated when leaderboard is fetched
          isPersonalBest: true,
          screenshot: validatedData.screenshot || "",
          replay: validatedData.replay || "",
        });

        await score.save();

        logger.info("New score submitted", {
          userId: user._id || user.id,
          username: freshUser.username,
          trackId: actualTrackId,
          time: validatedData.time,
          ip: req.ip,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Score submitted successfully",
        data: {
          score: {
            id: (score as any)._id.toString(),
            trackId: score.trackId,
            userId: score.userId,
            username: score.username,
            email: score.email,
            time: score.time,
            position: score.position,
            medal: score.medal,
            isPersonalBest: score.isPersonalBest,
            screenshot: score.screenshot,
            replay: score.replay,
            createdAt: score.createdAt,
            updatedAt: score.updatedAt,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Score submission validation failed", {
          errors: (error as any).errors,
          ip: req.ip,
        });
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: (error as any).errors,
        });
      }

      logger.error("Score submission error", {
        error: (error as Error).message,
        ip: req.ip,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// GET /api/scores/my-scores - Get current user's scores
router.get(
  "/my-scores",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user as any;

      if (!user) {
        logger.warn("Get my scores failed - no authenticated user", {
          ip: req.ip,
        });
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userScores = await Score.find({ userId: user._id || user.id }).sort(
        {
          createdAt: -1,
        }
      );

      logger.info("User scores retrieved", {
        userId: user._id || user.id,
        scoreCount: userScores.length,
        ip: req.ip,
      });

      return res.status(200).json({
        success: true,
        data: {
          scores: userScores.map((score) => ({
            id: (score as any)._id.toString(),
            trackId: score.trackId,
            userId: score.userId,
            username: score.username,
            email: score.email,
            time: score.time,
            position: score.position,
            medal: score.medal,
            isPersonalBest: score.isPersonalBest,
            screenshot: score.screenshot,
            replay: score.replay,
            createdAt: score.createdAt,
            updatedAt: score.updatedAt,
          })),
        },
      });
    } catch (error) {
      logger.error("Get my scores error", {
        error: (error as Error).message,
        ip: req.ip,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// GET /api/scores/track/:trackId - Get all scores for a specific track
router.get("/track/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;

    if (!trackId) {
      logger.warn("Get track scores failed - no track ID", {
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "Track ID is required",
      });
    }

    const scores = await Score.find({ trackId }).sort({ time: 1 });

    logger.info("Track scores retrieved", {
      trackId,
      scoreCount: scores.length,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: {
        scores: scores.map((score) => ({
          id: (score as any)._id.toString(),
          trackId: score.trackId,
          userId: score.userId,
          username: score.username,
          email: score.email,
          time: score.time,
          position: score.position,
          medal: score.medal,
          isPersonalBest: score.isPersonalBest,
          screenshot: score.screenshot,
          replay: score.replay,
          createdAt: score.createdAt,
          updatedAt: score.updatedAt,
        })),
      },
    });
  } catch (error) {
    logger.error("Get track scores error", {
      error: (error as Error).message,
      ip: req.ip,
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/scores/track/:trackId - Delete current user's score for a specific track
router.delete(
  "/track/:trackId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { trackId } = req.params;
      const user = req.user as any;

      if (!user) {
        logger.warn("Delete score failed - no authenticated user", {
          ip: req.ip,
        });
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!trackId) {
        logger.warn("Delete score failed - no track ID", {
          ip: req.ip,
        });
        return res.status(400).json({
          success: false,
          message: "Track ID is required",
        });
      }

      // Map weekly-challenge to actual weekly track ID
      const actualTrackId =
        trackId === "weekly-challenge" ? weeklyChallengeTrackId : trackId;

      // Find and delete the user's score for this track
      const deletedScore = await Score.findOneAndDelete({
        trackId: actualTrackId,
        userId: user._id || user.id,
      });

      if (!deletedScore) {
        logger.warn("Delete score failed - score not found", {
          userId: user._id || user.id,
          trackId: actualTrackId,
          ip: req.ip,
        });
        return res.status(404).json({
          success: false,
          message: "Score not found",
        });
      }

      logger.info("Score deleted successfully", {
        userId: user._id || user.id,
        username: deletedScore.username,
        trackId: actualTrackId,
        deletedTime: deletedScore.time,
        ip: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: "Score deleted successfully",
        data: {
          deletedScore: {
            id: (deletedScore as any)._id.toString(),
            trackId: deletedScore.trackId,
            userId: deletedScore.userId,
            username: deletedScore.username,
            time: deletedScore.time,
            createdAt: deletedScore.createdAt,
          },
        },
      });
    } catch (error) {
      logger.error("Delete score error", {
        error: (error as Error).message,
        ip: req.ip,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export { router as scoreRoutes };
