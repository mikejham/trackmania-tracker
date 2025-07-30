import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, LogOut, Flag, BarChart3, Plus } from "lucide-react";
import { useAuth, useLogout } from "../hooks/useAuth";
import { apiClient } from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { SubmitTimeModal } from "../components/SubmitTimeModal";
import type { Track } from "../types";

export const TracksPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaign" | "weekly">("campaign");
  const [selectedWeek, setSelectedWeek] = useState<number>(32); // Default to week 32
  const [defaultTrackForModal, setDefaultTrackForModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Check if user is admin
  const adminEmails = ["mokedok@gmail.com"];
  const isAdmin = user?.email && adminEmails.includes(user.email);

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

  // Filter tracks to show only weekly tracks
  const weeklyTracks =
    tracksData?.filter((track: Track) => track.mapType === "Weekly") || [];

  // Extract unique week numbers from weekly tracks for the dropdown
  const availableWeeks = React.useMemo(() => {
    const weeks = new Set<number>();
    weeklyTracks.forEach((track: Track) => {
      if (track.weekNumber) {
        weeks.add(track.weekNumber);
      }
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [weeklyTracks]);

  // Set default selected week to the first available week or current selection
  React.useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek)) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeek]);

  // Fetch leaderboards for visible tracks only
  const { data: leaderboardsData } = useQuery({
    queryKey: ["bulk-leaderboards", activeTab, selectedWeek, tracks.length],
    queryFn: async () => {
      // Get all visible tracks based on current tab and filters
      let visibleTracks = tracks;

      if (activeTab === "weekly") {
        visibleTracks = weeklyTracks.filter(
          (track: Track) => track.weekNumber === selectedWeek
        );
      } else {
        // For campaign tab, filter out weekly tracks
        visibleTracks = tracks.filter(
          (track: Track) =>
            track.mapType === "Campaign" ||
            (!track.mapType &&
              !track.id.includes("w32") &&
              !track.id.includes("w33"))
        );
      }

      // Add weekly challenge track if it's not already included
      const trackIds = visibleTracks.map((track) => track.id);

      // Limit to prevent abuse (max 20 tracks per request)
      const tracksToFetch = trackIds.slice(0, 20);

      try {
        const response = await apiClient.getBulkLeaderboards(tracksToFetch);
        return response.data.data.leaderboards.filter(
          (leaderboard): leaderboard is any => !leaderboard.error
        );
      } catch (error) {
        console.error("Failed to fetch bulk leaderboards:", error);
        return [];
      }
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
              <Flag className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please log in to access the track library.
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
      {/* Navigation Header - Mobile Optimized */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Flag className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-white">
                TrackMania Track Library
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/challenges")}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>Challenges</span>
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Global Leaderboards</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="sm:hidden flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-white/10">
            <Button
              onClick={() => navigate("/challenges")}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 flex-1 text-xs"
            >
              <Trophy className="w-3 h-3 mr-1" />
              Challenges
            </Button>
            <Button
              onClick={() => navigate("/tracks")}
              variant="ghost"
              size="sm"
              className="text-white bg-white/10 hover:bg-white/20 flex-1 text-xs"
            >
              <Flag className="w-3 h-3 mr-1" />
              Tracks
            </Button>
            <Button
              onClick={() => navigate("/leaderboard")}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 flex-1 text-xs"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Rankings
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Message - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Explore our track library and compete on your favorite tracks.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Plus className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
              <p className="text-gray-400 text-sm">
                Submit times and manage your records
              </p>
            </div>
          </div>

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

        {/* Tracks Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Flag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Track Library</h3>
              <p className="text-gray-400 text-sm">
                Browse and compete on all available tracks
              </p>
            </div>
          </div>

          {/* Tab Navigation - Mobile Optimized */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white/10 p-1 rounded-lg backdrop-blur">
              <button
                onClick={() => setActiveTab("campaign")}
                className={`flex-1 py-3 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === "campaign"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Campaign Maps</span>
                <span className="sm:hidden">Campaign</span>
              </button>
              <button
                onClick={() => setActiveTab("weekly")}
                className={`flex-1 py-3 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === "weekly"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Weekly Maps</span>
                <span className="sm:hidden">Weekly</span>
              </button>
            </div>
          </div>

          {/* Week Selection for Weekly Tab */}
          {activeTab === "weekly" && (
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h4 className="text-lg font-semibold text-white">
                  Week {selectedWeek} Maps
                </h4>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-white/70">Select Week:</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="bg-gray-800 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    style={{
                      backgroundColor: "#1f2937",
                      color: "white",
                    }}
                  >
                    {availableWeeks.map((week) => (
                      <option
                        key={week}
                        value={week}
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        Week {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tracks Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {tracksLoading || (activeTab === "weekly" && tracksLoading) ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : tracksError || (activeTab === "weekly" && tracksError) ? (
              <div className="col-span-full text-center text-red-500">
                Failed to load tracks. Please try again.
              </div>
            ) : (
              (activeTab === "weekly"
                ? weeklyTracks.filter(
                    (track: Track) => track.weekNumber === selectedWeek
                  )
                : tracks
              )
                .filter((track: any) => {
                  if (activeTab === "weekly") {
                    return track.mapType === "Weekly";
                  }
                  return (
                    track.mapType === "Campaign" ||
                    (!track.mapType &&
                      !track.id.includes("w32") &&
                      !track.id.includes("w33"))
                  );
                })
                .map((track: any) => {
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
              weeklyTracks.length === 0 && (
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
