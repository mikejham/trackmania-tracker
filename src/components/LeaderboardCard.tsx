import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Plus, Trophy, Clock, Users, Trash2 } from "lucide-react";
import { formatTime } from "../utils/time";
import { getMedalColorClass, getMedalEmoji } from "../utils/medal";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import type { Leaderboard, Track, Score } from "../types";

interface LeaderboardCardProps {
  leaderboard: Leaderboard;
  onAddTime?: (track: Track) => void;
  className?: string;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  leaderboard,
  onAddTime,
  className,
}) => {
  const { track, scores } = leaderboard;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedScoreId, setSelectedScoreId] = React.useState<string | null>(
    null
  );
  const topScores = scores.slice(0, 5); // Show top 5 for cleaner look

  // Check if current user has already submitted a time
  const currentUserScore = scores.find(
    (score) => score.userId === user?.id || score.username === user?.username
  );
  const hasUserParticipated = !!currentUserScore;

  // Delete score mutation
  const deleteScoreMutation = useMutation({
    mutationFn: async () => {
      return apiClient.deleteScore(track.id);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", "weekly-challenge"],
      });
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
      className={`${className} hover:shadow-lg transition-all duration-200 bg-white/95 backdrop-blur`}
    >
      <CardHeader className="pb-4">
        <CardTitle as="h2" className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                {track.mapType === "Weekly" && (
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                )}
                {track.mapType === "Campaign" && (
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                )}
                {track.mapType === "Custom" && (
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base sm:text-lg leading-tight truncate">
                  {track.name}
                </h3>
                <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    {track.difficulty}
                  </span>
                  <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 text-gray-600">
                    {track.mapType === "Weekly" && "🏁 Weekly"}
                    {track.mapType === "Campaign" && "🏆 Campaign"}
                    {track.mapType === "Custom" && "⚡ Custom"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative pt-0">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {scores.length} {scores.length === 1 ? "Time" : "Times"}
            </span>
          </div>
          {scores.length > 0 && (
            <div className="text-xs sm:text-sm text-gray-600">
              Best:{" "}
              <span className="font-mono font-bold text-primary">
                {formatTime(scores[0]?.time)}
              </span>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {topScores.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1 text-sm sm:text-base">
              No times recorded
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              Be the first to set a time!
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {topScores.map((score, index) => {
              const isUserScore =
                score.userId === user?.id || score.username === user?.username;
              const isSelected = selectedScoreId === score.id;

              return (
                <div
                  key={score.id}
                  className={`group p-2 sm:p-3 rounded-lg transition-all duration-150 border ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                      : "border border-gray-100"
                  } ${
                    isUserScore
                      ? "cursor-pointer hover:shadow-md"
                      : "hover:bg-gray-50"
                  } ${isSelected ? "shadow-md ring-2 ring-blue-200" : ""}`}
                  onClick={() => handleScoreClick(score)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      {/* Position & Medal */}
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-base sm:text-lg">
                          {getMedalEmoji(score.medal)}
                        </span>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span
                            className={`font-semibold text-gray-900 truncate text-xs sm:text-sm ${
                              isUserScore ? "text-blue-700 font-bold" : ""
                            }`}
                          >
                            {score.username}
                            {isUserScore && " (You)"}
                          </span>
                          {score.isPersonalBest && (
                            <span className="flex-shrink-0 inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                              ⭐ PB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time & Delete */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`font-mono text-sm sm:text-lg font-bold ${getMedalColorClass(
                            score.medal
                          )}`}
                        >
                          {formatTime(score.time)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(score.createdAt).toLocaleDateString()}
                        </div>
                      </div>

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
                </div>
              );
            })}
          </div>
        )}

        {/* Add Time Button */}
        {onAddTime && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
            <Button
              onClick={() => onAddTime(track)}
              className={`w-full font-medium py-2 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                hasUserParticipated
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {hasUserParticipated ? "Update Time" : "Add Your Time"}
              </span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
