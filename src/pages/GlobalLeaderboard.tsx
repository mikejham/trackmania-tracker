import React from "react";
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
} from "../services/api";

export const GlobalLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">Loading global rankings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 p-6">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 overflow-x-hidden">
      {/* Navigation Header - Mobile Optimized */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
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
          <div className="sm:hidden flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-white/10">
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

      <div className="p-4 sm:p-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              🏆 Global Leaderboards
            </h1>
            <p className="text-white/70 text-sm sm:text-lg">
              Champions across all tracks and weekly challenges
            </p>
          </div>

          {/* Global Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Global Champions */}
            <Card className="bg-white/10 backdrop-blur border-white/20 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <span>Global Champions</span>
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Most first place finishes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalRankings
                    .slice(0, 10)
                    .map((player: GlobalRanking, index: number) => (
                      <div
                        key={player.username}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border border-gray-400/30"
                            : index === 2
                            ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
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
                          <div>
                            <div className="font-semibold text-white">
                              {player.username}
                            </div>
                            <div className="text-xs text-white/60">
                              {player.weeklyWins} weekly wins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">
                            {player.firstPlaceWins}
                          </div>
                          <div className="text-xs text-white/60">wins</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Champions */}
            <Card className="bg-white/10 backdrop-blur border-white/20 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <span>Weekly Champions</span>
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Weekly challenge winners
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyChampions
                    .slice(0, 10)
                    .map((player: WeeklyChampion, index: number) => (
                      <div
                        key={player.username}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === 0
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-purple-500 text-white"
                                : "bg-slate-600 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {player.username}
                            </div>
                            <div className="text-xs text-white/60">
                              {player.firstPlaceWins} total wins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">
                            {player.weeklyWins}
                          </div>
                          <div className="text-xs text-white/60">weekly</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Active */}
            <Card className="bg-white/10 backdrop-blur border-white/20 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <span>Most Active</span>
                </CardTitle>
                <p className="text-white/60 text-sm">Times submitted</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostActive
                    .slice(0, 10)
                    .map((player: MostActivePlayer, index: number) => (
                      <div
                        key={player.username}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === 0
                            ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-green-500 text-white"
                                : "bg-slate-600 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {player.username}
                            </div>
                            <div className="text-xs text-white/60">
                              {player.firstPlaceWins} wins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">
                            {player.totalTimes}
                          </div>
                          <div className="text-xs text-white/60">times</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
