import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Trophy, Trash2, Target } from "lucide-react";
import { formatTime } from "../utils/time";
import { getMedalEmoji } from "../utils/medal";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import type { Track, Score } from "../types";

interface WeeklyChallengeCardProps {
  track: Track;
  onParticipate: () => void;
  participantCount?: number;
  topScores?: Score[];
  className?: string;
}

// Helper functions for week progress
const getWeekProgressText = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the current week (Monday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // End of the current week (Sunday)

  const timeRemaining = endOfWeek.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  if (hoursRemaining > 0) {
    return `${hoursRemaining}h ${minutesRemaining}m`;
  } else {
    return `${minutesRemaining}m`;
  }
};

const getWeekProgressPercentage = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the current week (Monday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // End of the current week (Sunday)

  const totalTime = endOfWeek.getTime() - startOfWeek.getTime();
  const timeElapsed = now.getTime() - startOfWeek.getTime();

  if (totalTime === 0) return 0; // Avoid division by zero
  return Math.min((timeElapsed / totalTime) * 100, 100);
};

export const WeeklyChallengeCard: React.FC<WeeklyChallengeCardProps> = ({
  track,
  onParticipate,
  participantCount = 0,
  topScores = [],
  className,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedScoreId, setSelectedScoreId] = React.useState<string | null>(
    null
  );

  // State to force re-render for live progress updates
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // Update progress every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Check if current user has already submitted a time
  const currentUserScore = topScores.find(
    (score) => score.userId === user?.id || score.username === user?.username
  );
  const hasUserParticipated = !!currentUserScore;

  // Delete score mutation
  const deleteScoreMutation = useMutation({
    mutationFn: async () => {
      return apiClient.deleteScore("weekly-challenge");
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", "weekly-challenge"],
      });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
      setSelectedScoreId(null); // Reset selection
    },
    onError: (error: any) => {
      console.error("Failed to delete score:", error);
    },
  });

  const handleDeleteScore = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your time? This action cannot be undone."
      )
    ) {
      deleteScoreMutation.mutate();
    }
  };

  const handleScoreClick = (score: Score) => {
    // Only allow interaction with user's own score
    if (score.userId === user?.id || score.username === user?.username) {
      setSelectedScoreId(selectedScoreId === score.id ? null : score.id);
    }
  };

  return (
    <Card
      className={`${className} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200`}
    >
      <CardHeader>
        <CardTitle
          as="h2"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-yellow-500 rounded-full">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-yellow-800">
                {track.name}
              </span>
              <div className="text-xs sm:text-sm text-yellow-600 font-normal mt-1">
                Week {track.weekNumber || "Current"} • {track.difficulty}{" "}
                Challenge
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-800">
                {participantCount}
              </div>
              <div className="text-xs text-yellow-600">Participants</div>
            </div>
            <Button
              onClick={onParticipate}
              className={
                hasUserParticipated
                  ? "bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white text-sm sm:text-base"
              }
            >
              <Target className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {hasUserParticipated ? "Update Time" : "Participate Now"}
              </span>
              <span className="sm:hidden">
                {hasUserParticipated ? "Update" : "Join"}
              </span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Challenge Description */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-base sm:text-lg mb-3 text-yellow-800">
              This Week's Challenge
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {track.challengeDescription ||
                "Master the ultimate stadium speedway! This week's challenge features tight corners, high-speed straights, and precision timing. Can you beat the author time?"}
            </p>
          </div>

          {/* Top Times */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base sm:text-lg text-yellow-800">
              Top Times
            </h3>
            {topScores.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <div className="text-3xl sm:text-4xl mb-2">🏁</div>
                <p className="text-sm">No times submitted yet</p>
                <p className="text-xs">Be the first to set a time!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topScores.slice(0, 5).map((score, index) => {
                  const isUserScore =
                    score.userId === user?.id ||
                    score.username === user?.username;
                  const isSelected = selectedScoreId === score.id;

                  return (
                    <div
                      key={score.id}
                      className={`flex items-center justify-between p-2 bg-yellow-100 rounded transition-all duration-200 ${
                        isUserScore ? "cursor-pointer hover:bg-yellow-200" : ""
                      } ${isSelected ? "bg-yellow-200" : ""}`}
                      onClick={() => handleScoreClick(score)}
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                        <span className="font-bold text-xs sm:text-sm min-w-[1.5rem] text-center">
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                          {index > 2 && `#${index + 1}`}
                        </span>
                        <span className="text-base sm:text-lg">
                          {getMedalEmoji(score.medal)}
                        </span>
                        <span
                          className={`font-medium text-xs sm:text-sm truncate ${
                            isUserScore ? "text-yellow-900 font-semibold" : ""
                          }`}
                        >
                          {score.username || score.user?.username || "Unknown"}
                          {isUserScore && " (You)"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <span className="font-mono font-bold text-yellow-800 text-xs sm:text-sm">
                          {formatTime(score.time)}
                        </span>

                        {/* Delete button that slides in */}
                        {isUserScore && (
                          <div
                            className={`transition-all duration-200 overflow-hidden ${
                              isSelected
                                ? "w-6 sm:w-8 opacity-100"
                                : "w-0 opacity-0"
                            }`}
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteScore();
                              }}
                              disabled={deleteScoreMutation.isPending}
                              className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              size="sm"
                            >
                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Week Progress</span>
            <span>{getWeekProgressText()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getWeekProgressPercentage()}%`,
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
