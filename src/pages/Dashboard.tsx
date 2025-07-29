import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trophy,
  Timer,
  Users,
  Calendar,
  LogOut,
  User,
  BarChart3,
} from "lucide-react";
import { apiClient } from "../services/api";
import { useAuth, useLogout } from "../hooks/useAuth";
import { SubmitTimeModal } from "../components/SubmitTimeModal";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { WeeklyChallengeCard } from "../components/WeeklyChallengeCard";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { formatTime } from "../utils/time";

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaign" | "weekly">("campaign");
  const [defaultTrackForModal, setDefaultTrackForModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch tracks
  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
  } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await apiClient.getTracks();
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const tracks = tracksData || [];

  // Fetch weekly challenge
  const {
    data: weeklyChallengeData,
    isLoading: weeklyChallengeLoading,
    error: weeklyChallengeError,
  } = useQuery({
    queryKey: ["weekly-challenge"],
    queryFn: async () => {
      const response = await apiClient.getWeeklyChallenge();
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch weekly challenge leaderboard
  const { data: weeklyChallengeLeaderboardData } = useQuery({
    queryKey: ["leaderboard", "weekly-challenge"],
    queryFn: async () => {
      try {
        const response = await apiClient.getLeaderboard("weekly-challenge");
        return response.data.data;
      } catch (error) {
        console.error("Failed to fetch weekly challenge leaderboard:", error);
        return null;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const weeklyChallengeLeaderboard = weeklyChallengeLeaderboardData || {
    trackId: "weekly-challenge",
    track: weeklyChallengeData?.track || {
      id: "weekly-challenge",
      name: "Weekly Challenge",
      author: "Unknown",
      difficulty: "Intermediate" as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mapType: "Weekly Challenge" as const,
    },
    scores: [],
    totalPlayers: 0,
    lastUpdated: new Date().toISOString(),
  };

  // Fetch leaderboards for visible tracks only (limit to first 8 to prevent rate limiting)
  const {
    data: leaderboardsData,
    isLoading: leaderboardsLoading,
    error: leaderboardsError,
  } = useQuery({
    queryKey: ["leaderboards", tracks.length],
    queryFn: async () => {
      // Only fetch leaderboards for the first 8 tracks to prevent rate limiting
      const tracksToFetch = tracks.slice(0, 8);
      const leaderboards = await Promise.all(
        tracksToFetch.map(async (track) => {
          try {
            const response = await apiClient.getLeaderboard(track.id);
            return response.data.data;
          } catch (error) {
            console.error(
              `Failed to fetch leaderboard for track ${track.id}:`,
              error
            );
            return null;
          }
        })
      );
      return leaderboards.filter(
        (leaderboard): leaderboard is any => leaderboard !== null
      );
    },
    enabled: tracks.length > 0, // Only run when tracks are loaded
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const leaderboards = leaderboardsData || [];

  const handleSubmitNewTime = () => {
    setDefaultTrackForModal(null);
    setIsModalOpen(true);
  };

  const handleParticipateInWeeklyChallenge = () => {
    if (weeklyChallengeData?.track) {
      setDefaultTrackForModal({
        id: weeklyChallengeData.track.id,
        name: weeklyChallengeData.track.name,
      });
      setIsModalOpen(true);
    }
  };

  const handleQuickAddTime = (track: any) => {
    setDefaultTrackForModal({
      id: track.id,
      name: track.name,
    });
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please log in to access the dashboard.
              </p>
              <Button onClick={() => (window.location.href = "/login")}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20">
      {/* Navigation Header */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  TrackMania Scoreboard
                </h1>
                <p className="text-xs text-white/60">
                  Professional Racing Times
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="sm"
                className="text-white bg-white/10 hover:bg-white/20"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Tracks
              </Button>
              <Button
                onClick={() => navigate("/leaderboard")}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Global Rankings
              </Button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/80">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-300">
            Ready to set some new records? Let's see what you can achieve today.
          </p>
        </div>

        {/* Weekly Challenge Card */}
        {weeklyChallengeData && weeklyChallengeData.track && (
          <div className="mb-8">
            <WeeklyChallengeCard
              track={{
                ...weeklyChallengeData.track,
                author: "Unknown",
                difficulty: "Intermediate" as const,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                mapType:
                  (weeklyChallengeData.track.mapType as any) ||
                  ("Weekly Challenge" as const),
              }}
              onParticipate={handleParticipateInWeeklyChallenge}
              participantCount={weeklyChallengeData.participantCount}
              topScores={weeklyChallengeLeaderboard.scores}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-4 px-0 pb-0">
              <Button
                onClick={handleSubmitNewTime}
                className="w-full rounded-none"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit New Time
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 p-1 rounded-lg backdrop-blur">
            <button
              onClick={() => setActiveTab("campaign")}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === "campaign"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Campaign Maps
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === "weekly"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Weekly Maps
            </button>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tracksLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : tracksError ? (
            <div className="col-span-full text-center text-red-500">
              Failed to load tracks. Please try again.
            </div>
          ) : (
            tracks
              .filter((track: any) => {
                if (activeTab === "weekly") {
                  return track.mapType === "Weekly" || track.id.includes("w32");
                }
                return (
                  track.mapType === "Campaign" ||
                  (!track.mapType && !track.id.includes("w32"))
                );
              })
              .map((track: any, index: number) => {
                const leaderboard = leaderboards.find(
                  (lb) => lb?.trackId === track.id
                );
                const trackWithDefaults = {
                  ...track,
                  author: "Unknown",
                  difficulty: "Intermediate" as const,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  mapType:
                    (track.mapType as any) ||
                    (activeTab === "weekly" ? "Weekly" : "Campaign"),
                };
                return (
                  <LeaderboardCard
                    key={track.id}
                    leaderboard={
                      leaderboard || {
                        trackId: track.id,
                        track: trackWithDefaults,
                        scores: [],
                        totalPlayers: 0,
                        lastUpdated: new Date().toISOString(),
                      }
                    }
                    onAddTime={() => handleQuickAddTime(track)}
                  />
                );
              })
          )}

          {/* Empty State for Weekly Tab */}
          {!tracksLoading &&
            !tracksError &&
            activeTab === "weekly" &&
            tracks.filter(
              (track: any) =>
                track.mapType === "Weekly" || track.id.includes("w32")
            ).length === 0 && (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Weekly Maps Available
                </h3>
                <p className="text-white/60">
                  Weekly maps will appear here when they're available. Check
                  back soon!
                </p>
              </div>
            )}
        </div>

        {/* Submit Time Modal */}
        <SubmitTimeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultTrack={defaultTrackForModal || undefined}
        />
      </div>
    </div>
  );
};
