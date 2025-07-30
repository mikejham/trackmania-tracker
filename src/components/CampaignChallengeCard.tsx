import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Timer, Users, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { apiClient } from "../services/api";
import { formatTime } from "../utils/time";
import { useAuth } from "../hooks/useAuth";
import type { Track, Score } from "../types";

interface CampaignChallengeCardProps {
  track: Track;
  onParticipate: () => void;
  participantCount: number;
  topScores: Score[];
}

// Campaign season dates
const CAMPAIGN_SEASONS = {
  Winter: { start: 1, end: 3 }, // January 1 - March 31
  Spring: { start: 4, end: 6 }, // April 1 - June 30
  Summer: { start: 7, end: 9 }, // July 1 - September 30
  Fall: { start: 10, end: 12 }, // October 1 - December 31
};

export const CampaignChallengeCard: React.FC<CampaignChallengeCardProps> = ({
  track,
  onParticipate,
  participantCount,
  topScores,
}) => {
  const queryClient = useQueryClient();
  const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);
  const { user } = useAuth();

  // Calculate campaign progress and time remaining
  const calculateCampaignProgress = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentDay = now.getDate();

    // Determine current campaign season
    let currentSeason: keyof typeof CAMPAIGN_SEASONS;
    let seasonStart: Date;
    let seasonEnd: Date;

    if (
      currentMonth >= CAMPAIGN_SEASONS.Winter.start &&
      currentMonth <= CAMPAIGN_SEASONS.Winter.end
    ) {
      currentSeason = "Winter";
      seasonStart = new Date(now.getFullYear(), 0, 1); // January 1
      seasonEnd = new Date(now.getFullYear(), 2, 31); // March 31
    } else if (
      currentMonth >= CAMPAIGN_SEASONS.Spring.start &&
      currentMonth <= CAMPAIGN_SEASONS.Spring.end
    ) {
      currentSeason = "Spring";
      seasonStart = new Date(now.getFullYear(), 3, 1); // April 1
      seasonEnd = new Date(now.getFullYear(), 5, 30); // June 30
    } else if (
      currentMonth >= CAMPAIGN_SEASONS.Summer.start &&
      currentMonth <= CAMPAIGN_SEASONS.Summer.end
    ) {
      currentSeason = "Summer";
      seasonStart = new Date(now.getFullYear(), 6, 1); // July 1
      seasonEnd = new Date(now.getFullYear(), 8, 30); // September 30
    } else {
      currentSeason = "Fall";
      seasonStart = new Date(now.getFullYear(), 9, 1); // October 1
      seasonEnd = new Date(now.getFullYear(), 11, 31); // December 31
    }

    const totalDuration = seasonEnd.getTime() - seasonStart.getTime();
    const elapsed = now.getTime() - seasonStart.getTime();
    const progress = Math.min(
      Math.max((elapsed / totalDuration) * 100, 0),
      100
    );

    const timeRemaining = seasonEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return {
      season: currentSeason,
      progress: Math.round(progress),
      daysRemaining,
      hoursRemaining,
      timeRemainingText:
        daysRemaining > 0
          ? `${daysRemaining}d ${hoursRemaining}h`
          : `${hoursRemaining}h`,
    };
  };

  const campaignInfo = calculateCampaignProgress();

  const deleteScoreMutation = useMutation({
    mutationFn: async (trackId: string) => {
      return apiClient.deleteScore(trackId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-challenge"] });
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", "campaign-challenge"],
      });
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
    (score) => score.username === user?.username
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
    <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/50 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-blue-300" />
            <div>
              <CardTitle className="text-xl text-white font-bold">
                {track.name}
              </CardTitle>
              <p className="text-blue-200 text-sm font-medium">
                {campaignInfo.season} Campaign • {track.difficulty} Challenge
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-300">
              {participantCount}
            </div>
            <div className="text-xs text-blue-200 font-medium">
              Participants
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Description */}
        <p className="text-white text-sm leading-relaxed font-medium">
          Master the ultimate {campaignInfo.season.toLowerCase()} campaign
          challenge! This challenge features the best of our campaign tracks
          with tight corners, high-speed straights, and precision timing. Can
          you beat the author time?
        </p>

        {/* Challenge Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-200 font-medium">
              Challenge Progress
            </span>
            <span className="text-blue-300 font-bold">
              {campaignInfo.progress}%
            </span>
          </div>
          <div className="w-full bg-blue-950/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${campaignInfo.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-200 font-medium">
            {campaignInfo.progress}% through the{" "}
            {campaignInfo.season.toLowerCase()} campaign
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onParticipate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors w-full font-semibold"
          >
            {currentUserScore ? "Update Time" : "Participate Now"}
          </Button>
        </div>

        {/* Top Times */}
        {topScores.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-blue-200 font-semibold text-sm">Top Times</h4>
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
                        ? "bg-blue-600/30 border border-blue-400/50"
                        : "bg-blue-950/30 hover:bg-blue-900/30"
                    }`}
                    onClick={() => handleScoreClick(score.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300 font-bold text-sm">
                        #{index + 1}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {score.username}
                        {isUserScore && (
                          <span className="text-blue-300 ml-1 font-semibold">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className={getMedalColor(score.medal)}>
                        {getMedalIcon(score.medal)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-200 font-mono text-sm font-semibold">
                        {formatTime(score.time)}
                      </span>
                      {isUserScore && isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScore(e, "campaign-challenge");
                          }}
                          disabled={deleteScoreMutation.isPending}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" />
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
            <h4 className="text-blue-200 font-semibold text-sm">Top Times</h4>
            <div className="text-center py-4 text-blue-300">
              <div className="text-2xl mb-2">🏁</div>
              <p className="text-sm font-medium">No times submitted yet</p>
              <p className="text-xs">Be the first to set a time!</p>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        <div className="text-center pt-2 border-t border-blue-700/50">
          <div className="text-blue-300 font-bold text-lg">
            {campaignInfo.timeRemainingText}
          </div>
          <div className="text-blue-200 text-xs font-medium">
            Time Remaining
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
