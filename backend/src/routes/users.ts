import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// GET /api/users/me - Get current user profile
router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    // Mock current user
    const currentUser = {
      id: "1",
      username: "SpeedDemon",
      email: "speed@trackmania.com",
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      data: currentUser,
    });
  })
);

// PATCH /api/users/me - Update profile
router.patch(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, email } = req.body;

    // Mock profile update
    const updatedUser = {
      id: "1",
      username: username || "SpeedDemon",
      email: email || "speed@trackmania.com",
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  })
);

// GET /api/users/:id/stats - Get user statistics
router.get(
  "/:id/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Mock user stats
    const userStats = {
      userId: id,
      totalRaces: 42,
      personalBests: 15,
      averagePosition: 3.2,
      totalPlayTime: 3600000, // 1 hour in milliseconds
      favoriteEnvironment: "Stadium",
      medals: {
        author: 2,
        gold: 8,
        silver: 15,
        bronze: 17,
      },
      weeklyWins: 3,
      campaignProgress: 85,
    };

    res.status(200).json({
      success: true,
      data: userStats,
    });
  })
);

export { router as userRoutes };
