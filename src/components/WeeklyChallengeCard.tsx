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
    <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-800/40 border-yellow-500/50 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <div>
              <CardTitle className="text-xl text-white font-bold">
                {track.name}
              </CardTitle>
              <p className="text-yellow-100 text-sm font-medium">
                Week {track.weekNumber || "Current"} • {track.difficulty}{" "}
                Challenge
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-300">
              {participantCount}
            </div>
            <div className="text-xs text-yellow-100 font-medium">
              Participants
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Description */}
        <p className="text-white text-sm leading-relaxed font-medium">
          {track.challengeDescription ||
            "Master the ultimate stadium speedway! This week's challenge features tight corners, high-speed straights, and precision timing. Can you beat the author time?"}
        </p>

        {/* Week Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-yellow-100 font-medium">Week Progress</span>
            <span className="text-yellow-300 font-bold">
              {Math.round(getWeekProgressPercentage())}%
            </span>
          </div>
          <div className="w-full bg-yellow-950/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getWeekProgressPercentage()}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-yellow-100 font-medium">
            {Math.round(getWeekProgressPercentage())}% through the week
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onParticipate}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors w-full font-semibold"
          >
            <Target className="w-5 h-5 mr-2" />
            {hasUserParticipated ? "Update Time" : "Participate Now"}
          </Button>
        </div>

        {/* Top Times */}
        {topScores.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-yellow-100 font-semibold text-sm">Top Times</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {topScores.slice(0, 3).map((score, index) => {
                const isUserScore =
                  score.userId === user?.id ||
                  score.username === user?.username;
                const isSelected = selectedScoreId === score.id;

                return (
                  <div
                    key={score.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-yellow-600/30 border border-yellow-400/50"
                        : "bg-yellow-950/30 hover:bg-yellow-900/30"
                    }`}
                    onClick={() => handleScoreClick(score)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-300 font-bold text-sm">
                        #{index + 1}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {score.username || score.user?.username || "Unknown"}
                        {isUserScore && (
                          <span className="text-yellow-300 ml-1 font-semibold">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-yellow-400">
                        {getMedalEmoji(score.medal)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-200 font-mono text-sm font-semibold">
                        {formatTime(score.time)}
                      </span>
                      {isUserScore && isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScore();
                          }}
                          disabled={deleteScoreMutation.isPending}
                          className="w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State for Top Times */}
        {topScores.length === 0 && (
          <div className="space-y-2">
            <h4 className="text-yellow-100 font-semibold text-sm">Top Times</h4>
            <div className="text-center py-4 text-yellow-300">
              <div className="text-2xl mb-2">🏁</div>
              <p className="text-sm font-medium">No times submitted yet</p>
              <p className="text-xs">Be the first to set a time!</p>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        <div className="text-center pt-2 border-t border-yellow-700/50">
          <div className="text-yellow-300 font-bold text-lg">
            {getWeekProgressText()}
          </div>
          <div className="text-yellow-100 text-xs font-medium">
            Time Remaining
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
