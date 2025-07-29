import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// GET /api/notifications - Get user notifications
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Mock notifications
    const mockNotifications = [
      {
        id: "1",
        userId: "1",
        type: "BEATEN_BY_FRIEND",
        title: "Your record was beaten!",
        message: "RaceKing beat your time on Stadium A01",
        data: {
          trackId: "1",
          trackName: "Stadium A01",
          beatenBy: "RaceKing",
          oldTime: 47500,
          newTime: 46800,
        },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: "2",
        userId: "1",
        type: "NEW_PERSONAL_BEST",
        title: "New Personal Best!",
        message: "You set a new personal best on Weekly Challenge #42",
        data: {
          trackId: "2",
          trackName: "Weekly Challenge #42",
          newTime: 79200,
          medal: "Gold",
        },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: "3",
        userId: "1",
        type: "NEW_WEEKLY_MAP",
        title: "New Weekly Map Available!",
        message: "Weekly Challenge #43 is now available",
        data: {
          trackId: "3",
          trackName: "Weekly Challenge #43",
          environment: "Valley",
        },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    ];

    res.status(200).json({
      success: true,
      data: mockNotifications,
      pagination: {
        page: 1,
        limit: 50,
        total: mockNotifications.length,
        totalPages: 1,
      },
    });
  })
);

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch(
  "/:id/read",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Mock marking as read
    const updatedNotification = {
      id,
      userId: "1",
      type: "BEATEN_BY_FRIEND",
      title: "Your record was beaten!",
      message: "RaceKing beat your time on Stadium A01",
      data: {},
      isRead: true,
      createdAt: new Date(),
    };

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updatedNotification,
    });
  })
);

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch(
  "/read-all",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  })
);

export { router as notificationRoutes };
