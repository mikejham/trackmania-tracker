import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Timer, Users, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { apiClient } from "../services/api";
import { formatTime } from "../utils/time";
import type { Track, Score } from "../types";

interface CampaignChallengeCardProps {
  track: Track;
  onParticipate: () => void;
  participantCount: number;
  topScores: Score[];
}

export const CampaignChallengeCard: React.FC<CampaignChallengeCardProps> = ({
  track,
  onParticipate,
  participantCount,
  topScores,
}) => {
  const queryClient = useQueryClient();
  const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);

  const deleteScoreMutation = useMutation({
    mutationFn: async (trackId: string) => {
      return apiClient.deleteScore(trackId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-leaderboards"] });
      setSelectedScoreId(null);
    },
    onError: (error) => {
      console.error("Failed to delete score:", error);
    },
  });

  const handleScoreClick = (scoreId: string) => {
    setSelectedScoreId(selectedScoreId === scoreId ? null : scoreId);
  };

  const handleDeleteScore = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this time?")) {
      deleteScoreMutation.mutate(trackId);
    }
  };

  // Find current user's score
  const currentUserScore = topScores.find(
    (score) => score.username === "mokemoke" // Replace with actual user lookup
  );

  const getMedalColor = (medal: string) => {
    switch (medal) {
      case "Author":
        return "text-green-500";
      case "Gold":
        return "text-yellow-500";
      case "Silver":
        return "text-gray-400";
      case "Bronze":
        return "text-orange-600";
      default:
        return "text-gray-500";
    }
  };

  const getMedalIcon = (medal: string) => {
    switch (medal) {
      case "Author":
        return "🏆";
      case "Gold":
        return "🥇";
      case "Silver":
        return "🥈";
      case "Bronze":
        return "🥉";
      default:
        return "🏁";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-blue-400" />
            <div>
              <CardTitle className="text-xl text-white">{track.name}</CardTitle>
              <p className="text-blue-300 text-sm">
                Campaign • {track.difficulty} Challenge
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {participantCount}
            </div>
            <div className="text-xs text-blue-300">Participants</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Description */}
        <p className="text-blue-200 text-sm leading-relaxed">
          Master the ultimate campaign challenge! This challenge features the
          best of our campaign tracks with tight corners, high-speed straights,
          and precision timing. Can you beat the author time?
        </p>

        {/* Challenge Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-300">Challenge Progress</span>
            <span className="text-blue-400 font-medium">60%</span>
          </div>
          <div className="w-full bg-blue-900/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: "60%" }}
            ></div>
          </div>
          <p className="text-xs text-blue-400">60% through the challenge</p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onParticipate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors w-full"
          >
            {currentUserScore ? "Update Time" : "Participate Now"}
          </Button>
        </div>

        {/* Top Times */}
        {topScores.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-blue-300 font-medium text-sm">Top Times</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {topScores.slice(0, 3).map((score, index) => (
                <div
                  key={score.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    selectedScoreId === score.id
                      ? "bg-blue-500/20 border border-blue-400/30"
                      : "bg-blue-900/20 hover:bg-blue-800/20"
                  }`}
                  onClick={() => handleScoreClick(score.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium text-sm">
                      #{index + 1}
                    </span>
                    <span className="text-white text-sm">
                      {score.username}
                      {score.username === "mokemoke" && (
                        <span className="text-blue-300 ml-1">(You)</span>
                      )}
                    </span>
                    <span className={getMedalColor(score.medal)}>
                      {getMedalIcon(score.medal)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-300 font-mono text-sm">
                      {formatTime(score.time)}
                    </span>
                    {selectedScoreId === score.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) =>
                          handleDeleteScore(e, "campaign-challenge")
                        }
                        disabled={deleteScoreMutation.isPending}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Remaining */}
        <div className="text-center pt-2 border-t border-blue-700/30">
          <div className="text-blue-400 font-medium">96h 0m</div>
          <div className="text-blue-300 text-xs">Time Remaining</div>
        </div>
      </CardContent>
    </Card>
  );
};
