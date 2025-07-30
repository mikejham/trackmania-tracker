import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { Score } from "../models/Score";
import { logger } from "../utils/logger";

const router = Router();

// In-memory storage for submitted scores (in production, this would be a database)
const submittedScores: any[] = [];

// Weekly challenge track (currently active)
let weeklyChallengeTrack = {
  id: "w33-4",
  name: "Weekly Challenge - Week 33 Map 4",
  difficulty: "Expert",
  mapType: "Weekly Challenge" as const,
  authorTime: 45000, // 45 seconds
  goldTime: 50000, // 50 seconds
  silverTime: 55000, // 55 seconds
  bronzeTime: 60000, // 60 seconds
  weekNumber: 33,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Summer 2025 Campaign Track Data
const mockTracks = [
  // Beginner Tracks (1-5)
  {
    id: "1",
    name: "Summer 2025 - 01",
    author: "Nadeo",
    difficulty: "Beginner",
    authorTime: 42000, // 42.000
    goldTime: 45000, // 45.000
    silverTime: 50000, // 50.000
    bronzeTime: 60000, // 1:00.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "2",
    name: "Summer 2025 - 02",
    author: "Nadeo",
    difficulty: "Beginner",
    authorTime: 38000, // 38.000
    goldTime: 42000, // 42.000
    silverTime: 48000, // 48.000
    bronzeTime: 58000, // 58.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "3",
    name: "Summer 2025 - 03",
    author: "Nadeo",
    difficulty: "Beginner",
    authorTime: 35000, // 35.000
    goldTime: 40000, // 40.000
    silverTime: 46000, // 46.000
    bronzeTime: 55000, // 55.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "4",
    name: "Summer 2025 - 04",
    author: "Nadeo",
    difficulty: "Beginner",
    authorTime: 32000, // 32.000
    goldTime: 38000, // 38.000
    silverTime: 44000, // 44.000
    bronzeTime: 52000, // 52.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "5",
    name: "Summer 2025 - 05",
    author: "Nadeo",
    difficulty: "Beginner",
    authorTime: 28000, // 28.000
    goldTime: 35000, // 35.000
    silverTime: 42000, // 42.000
    bronzeTime: 50000, // 50.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  // Weekly Tracks - Week 32 (1-5)
  {
    id: "w32-1",
    name: "Weekly 32 - 01",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 45000, // 45.000
    goldTime: 50000, // 50.000
    silverTime: 58000, // 58.000
    bronzeTime: 70000, // 1:10.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-01"),
  },
  {
    id: "w32-2",
    name: "Weekly 32 - 02",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 52000, // 52.000
    goldTime: 58000, // 58.000
    silverTime: 68000, // 1:08.000
    bronzeTime: 82000, // 1:22.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-01"),
  },
  {
    id: "w32-3",
    name: "Weekly 32 - 03",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 48000, // 48.000
    goldTime: 55000, // 55.000
    silverTime: 65000, // 1:05.000
    bronzeTime: 78000, // 1:18.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-01"),
  },
  {
    id: "w32-4",
    name: "Weekly 32 - 04",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 55000, // 55.000
    goldTime: 62000, // 1:02.000
    silverTime: 72000, // 1:12.000
    bronzeTime: 85000, // 1:25.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-01"),
  },
  {
    id: "w32-5",
    name: "Weekly 32 - 05",
    author: "Nadeo",
    difficulty: "Expert",
    authorTime: 42000, // 42.000
    goldTime: 48000, // 48.000
    silverTime: 56000, // 56.000
    bronzeTime: 68000, // 1:08.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-01"),
  },
  // Weekly Tracks - Week 33 (1-5)
  {
    id: "w33-1",
    name: "Weekly 33 - 01",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 46000, // 46.000
    goldTime: 52000, // 52.000
    silverTime: 60000, // 1:00.000
    bronzeTime: 72000, // 1:12.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-08"),
    updatedAt: new Date("2025-08-08"),
  },
  {
    id: "w33-2",
    name: "Weekly 33 - 02",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 53000, // 53.000
    goldTime: 59000, // 59.000
    silverTime: 69000, // 1:09.000
    bronzeTime: 83000, // 1:23.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-08"),
    updatedAt: new Date("2025-08-08"),
  },
  {
    id: "w33-3",
    name: "Weekly 33 - 03",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 49000, // 49.000
    goldTime: 56000, // 56.000
    silverTime: 66000, // 1:06.000
    bronzeTime: 79000, // 1:19.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-08"),
    updatedAt: new Date("2025-08-08"),
  },
  {
    id: "w33-4",
    name: "Weekly 33 - 04",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 56000, // 56.000
    goldTime: 63000, // 1:03.000
    silverTime: 73000, // 1:13.000
    bronzeTime: 86000, // 1:26.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-08"),
    updatedAt: new Date("2025-08-08"),
  },
  {
    id: "w33-5",
    name: "Weekly 33 - 05",
    author: "Nadeo",
    difficulty: "Expert",
    authorTime: 43000, // 43.000
    goldTime: 49000, // 49.000
    silverTime: 57000, // 57.000
    bronzeTime: 69000, // 1:09.000
    mapType: "Weekly",
    isActive: true,
    createdAt: new Date("2025-08-08"),
    updatedAt: new Date("2025-08-08"),
  },
  // Intermediate Tracks (6-15)
  {
    id: "6",
    name: "Summer 2025 - 06",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 45000, // 45.000
    goldTime: 50000, // 50.000
    silverTime: 58000, // 58.000
    bronzeTime: 70000, // 1:10.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "7",
    name: "Summer 2025 - 07",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 52000, // 52.000
    goldTime: 58000, // 58.000
    silverTime: 68000, // 1:08.000
    bronzeTime: 82000, // 1:22.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "8",
    name: "Summer 2025 - 08",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 48000, // 48.000
    goldTime: 55000, // 55.000
    silverTime: 65000, // 1:05.000
    bronzeTime: 78000, // 1:18.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "9",
    name: "Summer 2025 - 09",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 55000, // 55.000
    goldTime: 62000, // 1:02.000
    silverTime: 72000, // 1:12.000
    bronzeTime: 85000, // 1:25.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "10",
    name: "Summer 2025 - 10",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 42000, // 42.000
    goldTime: 48000, // 48.000
    silverTime: 56000, // 56.000
    bronzeTime: 68000, // 1:08.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "11",
    name: "Summer 2025 - 11",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 58000, // 58.000
    goldTime: 65000, // 1:05.000
    silverTime: 75000, // 1:15.000
    bronzeTime: 88000, // 1:28.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "12",
    name: "Summer 2025 - 12",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 50000, // 50.000
    goldTime: 57000, // 57.000
    silverTime: 67000, // 1:07.000
    bronzeTime: 80000, // 1:20.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "13",
    name: "Summer 2025 - 13",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 47000, // 47.000
    goldTime: 54000, // 54.000
    silverTime: 64000, // 1:04.000
    bronzeTime: 77000, // 1:17.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "14",
    name: "Summer 2025 - 14",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 53000, // 53.000
    goldTime: 60000, // 1:00.000
    silverTime: 70000, // 1:10.000
    bronzeTime: 83000, // 1:23.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "15",
    name: "Summer 2025 - 15",
    author: "Nadeo",
    difficulty: "Intermediate",
    authorTime: 46000, // 46.000
    goldTime: 53000, // 53.000
    silverTime: 63000, // 1:03.000
    bronzeTime: 76000, // 1:16.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  // Advanced Tracks (16-25)
  {
    id: "16",
    name: "Summer 2025 - 16",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 62000, // 1:02.000
    goldTime: 70000, // 1:10.000
    silverTime: 82000, // 1:22.000
    bronzeTime: 95000, // 1:35.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "17",
    name: "Summer 2025 - 17",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 68000, // 1:08.000
    goldTime: 76000, // 1:16.000
    silverTime: 88000, // 1:28.000
    bronzeTime: 102000, // 1:42.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "18",
    name: "Summer 2025 - 18",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 55000, // 55.000
    goldTime: 63000, // 1:03.000
    silverTime: 75000, // 1:15.000
    bronzeTime: 88000, // 1:28.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "19",
    name: "Summer 2025 - 19",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 72000, // 1:12.000
    goldTime: 80000, // 1:20.000
    silverTime: 92000, // 1:32.000
    bronzeTime: 105000, // 1:45.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "20",
    name: "Summer 2025 - 20",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 65000, // 1:05.000
    goldTime: 73000, // 1:13.000
    silverTime: 85000, // 1:25.000
    bronzeTime: 98000, // 1:38.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "21",
    name: "Summer 2025 - 21",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 59000, // 59.000
    goldTime: 67000, // 1:07.000
    silverTime: 79000, // 1:19.000
    bronzeTime: 92000, // 1:32.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "22",
    name: "Summer 2025 - 22",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 75000, // 1:15.000
    goldTime: 83000, // 1:23.000
    silverTime: 95000, // 1:35.000
    bronzeTime: 108000, // 1:48.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "23",
    name: "Summer 2025 - 23",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 63000, // 1:03.000
    goldTime: 71000, // 1:11.000
    silverTime: 83000, // 1:23.000
    bronzeTime: 96000, // 1:36.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "24",
    name: "Summer 2025 - 24",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 67000, // 1:07.000
    goldTime: 75000, // 1:15.000
    silverTime: 87000, // 1:27.000
    bronzeTime: 100000, // 1:40.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "25",
    name: "Summer 2025 - 25",
    author: "Nadeo",
    difficulty: "Advanced",
    authorTime: 70000, // 1:10.000
    goldTime: 78000, // 1:18.000
    silverTime: 90000, // 1:30.000
    bronzeTime: 103000, // 1:43.000
    mapType: "Campaign",
    isActive: true,
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  },
];

// GET /api/tracks - List all tracks
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { mapType, isActive } = req.query;

    // Don't include weeklyChallengeTrack in main tracks list since it's a duplicate of w32-1
    let filteredTracks = [...mockTracks];

    if (mapType) {
      filteredTracks = filteredTracks.filter(
        (track) => track.mapType === mapType
      );
    }

    if (isActive !== undefined) {
      filteredTracks = filteredTracks.filter(
        (track) => track.isActive === (isActive === "true")
      );
    }

    res.status(200).json({
      success: true,
      data: filteredTracks,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredTracks.length,
        totalPages: 1,
      },
    });
    return;
  })
);

// GET /api/tracks/weekly-challenge - Get current weekly challenge
router.get(
  "/weekly-challenge",
  asyncHandler(async (req: Request, res: Response) => {
    // Calculate week progress (mock data for now)
    const weekProgress = 75; // 75% through the week
    const weekProgressText = `${weekProgress}% through the week`;

    // Get participant count from MongoDB
    const participantCount = await Score.countDocuments({
      trackId: "w33-4", // Use the actual weekly track ID
    });

    res.status(200).json({
      success: true,
      data: {
        track: weeklyChallengeTrack,
        participantCount,
        weekProgress,
        weekProgressText,
      },
    });
    return;
  })
);

// Update weekly challenge track
router.put("/weekly-challenge", async (req, res) => {
  try {
    const { trackId } = req.body;

    if (!trackId) {
      return res.status(400).json({
        success: false,
        message: "Track ID is required",
      });
    }

    // Find the track to make sure it exists
    const track = mockTracks.find((t) => t.id === trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Update the weekly challenge track
    weeklyChallengeTrack = track;

    logger.info("Weekly challenge updated", {
      trackId,
      trackName: track.name,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Weekly challenge updated successfully",
      data: {
        track: weeklyChallengeTrack,
        participantCount: Math.floor(Math.random() * 50) + 10,
        weekProgress: "75%",
        weekProgressText: "3 days remaining",
      },
    });
  } catch (error) {
    logger.error("Failed to update weekly challenge", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update weekly challenge",
    });
  }
});

// GET /api/tracks/global-leaderboard - Get global rankings across all tracks
router.get(
  "/global-leaderboard",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      logger.info("Global leaderboard request received", { ip: req.ip });

      // Get all scores from MongoDB
      const allScores = await Score.find({}).sort({ time: 1 });
      logger.info("Retrieved scores from database", {
        scoreCount: allScores.length,
        ip: req.ip,
      });

      // Group scores by track to find first place winners
      const trackGroups = allScores.reduce((acc, score) => {
        if (!acc[score.trackId]) {
          acc[score.trackId] = [];
        }
        acc[score.trackId].push(score);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate first place wins for each user
      const firstPlaceWins: Record<string, number> = {};
      const weeklyWins: Record<string, number> = {};
      const totalTimes: Record<string, number> = {};
      const bestTimes: Record<
        string,
        { trackId: string; time: number; trackName: string }[]
      > = {};

      Object.entries(trackGroups).forEach(([trackId, scores]) => {
        if (scores.length > 0) {
          // Sort by time (best first)
          scores.sort((a, b) => a.time - b.time);
          const firstPlace = scores[0];

          // Count first place wins
          firstPlaceWins[firstPlace.username] =
            (firstPlaceWins[firstPlace.username] || 0) + 1;

          // Count weekly challenge wins
          if (
            trackId.startsWith("w32-") ||
            trackId.startsWith("w33-") ||
            trackId === "weekly-challenge"
          ) {
            weeklyWins[firstPlace.username] =
              (weeklyWins[firstPlace.username] || 0) + 1;
          }

          // Count total times submitted
          scores.forEach((score) => {
            totalTimes[score.username] = (totalTimes[score.username] || 0) + 1;

            // Track personal bests
            if (!bestTimes[score.username]) {
              bestTimes[score.username] = [];
            }

            // Find track name from mock data
            const track = mockTracks.find((t) => t.id === trackId);
            const trackName = track ? track.name : `Track ${trackId}`;

            bestTimes[score.username].push({
              trackId,
              time: score.time,
              trackName,
            });
          });
        }
      });

      // Create global leaderboard rankings
      const globalRankings = Object.entries(firstPlaceWins)
        .map(([username, wins]) => ({
          username,
          firstPlaceWins: wins,
          weeklyWins: weeklyWins[username] || 0,
          totalTimes: totalTimes[username] || 0,
          personalBests:
            bestTimes[username]?.sort((a, b) => a.time - b.time).slice(0, 5) ||
            [],
        }))
        .sort((a, b) => b.firstPlaceWins - a.firstPlaceWins);

      // Weekly champions (sorted by weekly wins)
      const weeklyChampions = Object.entries(weeklyWins)
        .map(([username, wins]) => ({
          username,
          weeklyWins: wins,
          firstPlaceWins: firstPlaceWins[username] || 0,
          totalTimes: totalTimes[username] || 0,
        }))
        .sort((a, b) => b.weeklyWins - a.weeklyWins);

      // Most active players (by total times submitted)
      const mostActive = Object.entries(totalTimes)
        .map(([username, times]) => ({
          username,
          totalTimes: times,
          firstPlaceWins: firstPlaceWins[username] || 0,
          weeklyWins: weeklyWins[username] || 0,
        }))
        .sort((a, b) => b.totalTimes - a.totalTimes)
        .slice(0, 10);

      const responseData = {
        globalRankings: globalRankings.slice(0, 10), // Top 10
        weeklyChampions: weeklyChampions.slice(0, 10), // Top 10
        mostActive,
        stats: {
          totalPlayers: new Set([
            ...Object.keys(firstPlaceWins),
            ...Object.keys(totalTimes),
          ]).size,
          totalTracks: Object.keys(trackGroups).length,
          totalScores: allScores.length,
          lastUpdated: new Date().toISOString(),
        },
      };

      logger.info("Global leaderboard response prepared", {
        globalRankingsCount: responseData.globalRankings.length,
        weeklyChampionsCount: responseData.weeklyChampions.length,
        mostActiveCount: responseData.mostActive.length,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: responseData,
      });
      return;
    } catch (error) {
      logger.error("Get global leaderboard error", {
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip: req.ip,
      });
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
      return;
    }
  })
);

// GET /api/tracks/week/:weekNumber - Get tracks for a specific week
router.get(
  "/week/:weekNumber",
  asyncHandler(async (req: Request, res: Response) => {
    const { weekNumber } = req.params;
    const week = parseInt(weekNumber);

    if (isNaN(week)) {
      return res.status(400).json({
        success: false,
        message: "Invalid week number",
      });
    }

    // Filter tracks by week number (extract from track ID like "w32-1")
    const weekTracks = mockTracks.filter((track) => {
      if (track.mapType === "Weekly") {
        const trackWeek = parseInt(track.id.split("-")[0].substring(1));
        return trackWeek === week;
      }
      return false;
    });

    if (weekTracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No tracks found for week ${week}`,
      });
    }

    res.status(200).json({
      success: true,
      data: weekTracks,
      week: week,
      trackCount: weekTracks.length,
    });
    return;
  })
);

// GET /api/tracks/:id - Get single track
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const track = mockTracks.find((t) => t.id === id);

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    res.status(200).json({
      success: true,
      data: track,
    });
    return;
  })
);

// GET /api/tracks/:id/leaderboard - Get track leaderboard
router.get(
  "/:id/leaderboard",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if it's the weekly challenge track
    let track = null;
    let actualTrackId = id;
    if (id === "weekly-challenge") {
      track = weeklyChallengeTrack;
      actualTrackId = "w33-4"; // Use the actual weekly track ID for scores
    } else {
      track = mockTracks.find((t) => t.id === id);
    }

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Get scores from MongoDB using the actual track ID
    const trackScores = await Score.find({ trackId: actualTrackId }).sort({
      time: 1,
    });

    // Update positions and calculate medals after sorting
    trackScores.forEach((score: any, index: number) => {
      score.position = index + 1;

      // Calculate medal based on track times
      if (track.authorTime && score.time <= track.authorTime) {
        score.medal = "Author";
      } else if (track.goldTime && score.time <= track.goldTime) {
        score.medal = "Gold";
      } else if (track.silverTime && score.time <= track.silverTime) {
        score.medal = "Silver";
      } else if (track.bronzeTime && score.time <= track.bronzeTime) {
        score.medal = "Bronze";
      } else {
        score.medal = "None";
      }

      // Set isPersonalBest to true for now (in a real app, this would check against user's previous times)
      score.isPersonalBest = true;
    });

    // Save updated scores back to database
    await Promise.all(trackScores.map((score: any) => score.save()));

    const leaderboard = {
      trackId: id,
      track,
      scores: trackScores.map((score: any) => ({
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
      totalPlayers: trackScores.length,
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
    return;
  })
);

// Function to add a submitted score to storage
export const addSubmittedScore = (score: any) => {
  submittedScores.push(score);
};

// Function to get all submitted scores
export const getSubmittedScores = () => {
  return submittedScores;
};

export { router as trackRoutes };
