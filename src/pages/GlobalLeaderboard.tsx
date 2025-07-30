import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Timer,
  Crown,
  TrendingUp,
  Calendar,
  BarChart3,
  LogOut,
  User,
  Target,
} from "lucide-react";
import { apiClient } from "../services/api";
import { useAuth, useLogout } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import type {
  GlobalRanking,
  WeeklyChampion,
  MostActivePlayer,
  CampaignRanking,
} from "../services/api";

type LeaderboardTab = "global" | "campaign" | "weekly" | "active";

export const GlobalLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("global");

  // Fetch global leaderboard data
  const {
    data: globalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["global-leaderboard"],
    queryFn: async () => {
      const response = await apiClient.getGlobalLeaderboard();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch campaign leaderboard data
  const {
    data: campaignData,
    isLoading: campaignLoading,
    error: campaignError,
  } = useQuery({
    queryKey: ["campaign-leaderboard"],
    queryFn: async () => {
      const response = await apiClient.getCampaignLeaderboard();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">Loading global rankings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || campaignError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              Failed to load global leaderboards
            </div>
            <p className="text-white/60">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const { globalRankings, weeklyChampions, mostActive, stats } = globalData || {
    globalRankings: [],
    weeklyChampions: [],
    mostActive: [],
    stats: {
      totalPlayers: 0,
      totalTracks: 0,
      totalScores: 0,
      lastUpdated: new Date().toISOString(),
    },
  };

  const { campaignRankings } = campaignData || {
    campaignRankings: [],
  };

  const tabs = [
    {
      id: "global" as LeaderboardTab,
      label: "Global",
      fullLabel: "Global Champions",
      icon: Crown,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-400/30",
    },
    {
      id: "campaign" as LeaderboardTab,
      label: "Campaign",
      fullLabel: "Campaign Champions",
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400/30",
    },
    {
      id: "weekly" as LeaderboardTab,
      label: "Weekly",
      fullLabel: "Weekly Champions",
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-400/30",
    },
    {
      id: "active" as LeaderboardTab,
      label: "Active",
      fullLabel: "Most Active",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-400/30",
    },
  ];

  const renderLeaderboardContent = () => {
    switch (activeTab) {
      case "global":
        return (
          <div className="space-y-0.5 sm:space-y-2">
            {globalRankings
              .slice(0, 20)
              .map((player: GlobalRanking, index: number) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between px-1 py-1.5 sm:px-4 sm:py-3 rounded-lg transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border border-gray-400/30"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    <div
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-orange-500 text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm sm:text-base truncate">
                        {player.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-6">
                    {player.weeklyWins > 0 && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span className="text-xs sm:text-sm text-white/70">
                          {player.weeklyWins}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Timer className="w-3 h-3 text-green-400" />
                      <span className="text-xs sm:text-sm text-white/70">
                        {player.totalTimes}
                      </span>
                    </div>
                    <div className="text-right min-w-[40px] sm:min-w-[60px]">
                      <div className="font-bold text-white text-sm sm:text-base">
                        {player.firstPlaceWins}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      case "campaign":
        return (
          <div className="space-y-0.5 sm:space-y-2">
            {campaignRankings
              .slice(0, 20)
              .map((player: CampaignRanking, index: number) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between px-1 py-1.5 sm:px-4 sm:py-3 rounded-lg transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border border-gray-400/30"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    <div
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-bold ${
                        index === 0
                          ? "bg-blue-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-orange-500 text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm sm:text-base truncate">
                        {player.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    {/* Medal stats - only show if > 0 */}
                    {player.firstPlaceWins > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-xs sm:text-sm text-white/70">
                          {player.firstPlaceWins}
                        </span>
                      </div>
                    )}
                    {player.secondPlaceWins > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="text-xs sm:text-sm text-white/70">
                          {player.secondPlaceWins}
                        </span>
                      </div>
                    )}
                    {player.thirdPlaceWins > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-xs sm:text-sm text-white/70">
                          {player.thirdPlaceWins}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-blue-400" />
                      <span className="text-xs sm:text-sm text-white/70">
                        {player.totalTracks}
                      </span>
                    </div>
                    <div className="text-right min-w-[40px] sm:min-w-[60px]">
                      <div className="font-bold text-white text-sm sm:text-base">
                        {player.points}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      case "weekly":
        return (
          <div className="space-y-0.5 sm:space-y-2">
            {weeklyChampions
              .slice(0, 20)
              .map((player: WeeklyChampion, index: number) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between px-1 py-1.5 sm:px-4 sm:py-3 rounded-lg transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    <div
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-bold ${
                        index === 0
                          ? "bg-purple-500 text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm sm:text-base truncate">
                        {player.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-6">
                    <div className="flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs sm:text-sm text-white/70">
                        {player.firstPlaceWins}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Timer className="w-3 h-3 text-green-400" />
                      <span className="text-xs sm:text-sm text-white/70">
                        {player.totalTimes}
                      </span>
                    </div>
                    <div className="text-right min-w-[40px] sm:min-w-[60px]">
                      <div className="font-bold text-white text-sm sm:text-base">
                        {player.weeklyWins}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      case "active":
        return (
          <div className="space-y-0.5 sm:space-y-2">
            {mostActive
              .slice(0, 20)
              .map((player: MostActivePlayer, index: number) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between px-1 py-1.5 sm:px-4 sm:py-3 rounded-lg transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    <div
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-bold ${
                        index === 0
                          ? "bg-green-500 text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm sm:text-base truncate">
                        {player.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-6">
                    {player.firstPlaceWins > 0 && (
                      <div className="flex items-center space-x-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs sm:text-sm text-white/70">
                          {player.firstPlaceWins}
                        </span>
                      </div>
                    )}
                    {player.weeklyWins > 0 && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span className="text-xs sm:text-sm text-white/70">
                          {player.weeklyWins}
                        </span>
                      </div>
                    )}
                    <div className="text-right min-w-[40px] sm:min-w-[60px]">
                      <div className="font-bold text-white text-sm sm:text-base">
                        {player.totalTimes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 overflow-x-hidden">
      {/* Navigation Header - Mobile Optimized */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-3 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-primary/20 rounded-full">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  TrackMania Scoreboard
                </h1>
                <p className="text-xs text-white/60">
                  Professional Racing Times
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-white">TrackMania</h1>
                <p className="text-xs text-white/60">Scoreboard</p>
              </div>
            </div>

            {/* Navigation Links - Mobile Optimized */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Tracks
              </Button>
              <Button
                onClick={() => navigate("/leaderboard")}
                variant="ghost"
                size="sm"
                className="text-white bg-white/10 hover:bg-white/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Global Rankings
              </Button>
            </div>

            {/* User Menu - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-white/80">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 px-2 sm:px-3"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="sm:hidden flex items-center justify-center space-x-4 mt-2 pt-2 border-t border-white/10">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 flex-1"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Tracks
            </Button>
            <Button
              onClick={() => navigate("/leaderboard")}
              variant="ghost"
              size="sm"
              className="text-white bg-white/10 hover:bg-white/20 flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Rankings
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-0 sm:p-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-0 sm:px-6">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-2 sm:mb-8">
            <h1 className="text-xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
              🏆 Global Leaderboards
            </h1>
            <p className="text-white/70 text-sm sm:text-lg">
              Champions across all tracks and weekly challenges
            </p>
          </div>

          {/* Tab Navigation - Mobile Optimized */}
          <div className="mb-2 sm:mb-8">
            <div className="flex gap-1 sm:gap-4 justify-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-1 py-1 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 flex-1 sm:flex-none ${
                      isActive
                        ? `${tab.bgColor} ${tab.borderColor} border text-white`
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        isActive ? tab.color : ""
                      }`}
                    />
                    <span className="font-medium text-xs sm:text-sm">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Content */}
          <Card className="bg-white/10 backdrop-blur border-white/20 mx-0 sm:mx-6">
            <CardHeader className="pb-2 sm:pb-4 px-2 sm:px-6">
              <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-white">
                {(() => {
                  const activeTabData = tabs.find(
                    (tab) => tab.id === activeTab
                  );
                  const Icon = activeTabData?.icon || Crown;
                  return (
                    <>
                      <Icon
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          activeTabData?.color || "text-yellow-400"
                        }`}
                      />
                      <span className="text-xl sm:text-2xl">
                        {activeTabData?.fullLabel || "Leaderboard"}
                      </span>
                    </>
                  );
                })()}
              </CardTitle>
              <div className="text-white/60 text-sm">
                {activeTab === "campaign" &&
                  "Each position is worth different points (1st=10, 2nd=7, 3rd=5, 4th=3, 5th=1)"}
                {activeTab === "global" &&
                  "Most first place finishes across all tracks"}
                {activeTab === "weekly" && "Weekly challenge winners"}
                {activeTab === "active" &&
                  "Players with the most times submitted"}
              </div>
            </CardHeader>
            <CardContent className="p-1 sm:p-6">
              {renderLeaderboardContent()}
            </CardContent>
          </Card>

          {/* Global Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-3 sm:p-6 text-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {stats.totalPlayers}
                </div>
                <div className="text-white/60 text-xs sm:text-sm">
                  Total Players
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-3 sm:p-6 text-center">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {stats.totalTracks}
                </div>
                <div className="text-white/60 text-xs sm:text-sm">
                  Total Tracks
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-3 sm:p-6 text-center">
                <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {stats.totalScores}
                </div>
                <div className="text-white/60 text-xs sm:text-sm">
                  Times Submitted
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-3 sm:p-6 text-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {new Date(stats.lastUpdated).toLocaleDateString()}
                </div>
                <div className="text-white/60 text-xs sm:text-sm">
                  Last Updated
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
