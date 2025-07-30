import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  Shield,
  Trophy,
  Users,
  BarChart3,
} from "lucide-react";
import { apiClient } from "../services/api";
import { useAuth, useLogout } from "../hooks/useAuth";
import type { Track } from "../types";

interface WeeklyChallenge {
  track: Track;
  participantCount: number;
  weekProgress: string;
  weekProgressText: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<string>("");

  // Fetch all tracks for the dropdown
  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await apiClient.getTracks();
      return response.data.data;
    },
  });

  // Fetch current weekly challenge
  const { data: weeklyChallengeData } = useQuery({
    queryKey: ["weekly-challenge"],
    queryFn: async () => {
      const response = await apiClient.getWeeklyChallenge();
      return response.data.data;
    },
  });

  // Mutation to update weekly challenge
  const updateWeeklyChallengeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await apiClient.updateWeeklyChallenge(trackId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", "weekly-challenge"],
      });
      setSelectedTrack("");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleUpdateWeeklyChallenge = () => {
    if (selectedTrack) {
      updateWeeklyChallengeMutation.mutate(selectedTrack);
    }
  };

  const handleTrackChange = (trackId: string) => {
    setSelectedTrack(trackId);
  };

  // Filter tracks to show only weekly tracks
  const weeklyTracks =
    tracksData?.filter((track: Track) => track.mapType === "Weekly") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Challenge Management */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">
                Weekly Challenge
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-medium mb-2">
                  Current Challenge
                </p>
                <p className="text-white font-semibold">
                  {weeklyChallengeData?.track?.name || "Loading..."}
                </p>
                <p className="text-white/70 text-sm">
                  {weeklyChallengeData?.participantCount || 0} participants
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">
                  Change to:
                </label>
                <select
                  value={selectedTrack}
                  onChange={(e) => handleTrackChange(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a weekly track...</option>
                  {weeklyTracks.map((track: Track) => (
                    <option key={track.id} value={track.id}>
                      {track.name} (Week {track.weekNumber})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleUpdateWeeklyChallenge}
                  disabled={
                    !selectedTrack || updateWeeklyChallengeMutation.isPending
                  }
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {updateWeeklyChallengeMutation.isPending
                    ? "Updating..."
                    : "Update Challenge"}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-white">Statistics</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Total Tracks</span>
                <span className="text-white font-semibold">
                  {tracksData?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Weekly Tracks</span>
                <span className="text-white font-semibold">
                  {weeklyTracks.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Campaign Tracks</span>
                <span className="text-white font-semibold">
                  {tracksData?.filter((t: Track) => t.mapType === "Campaign")
                    .length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">
                Quick Actions
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Dashboard
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Global Leaderboards
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {updateWeeklyChallengeMutation.isSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-medium">
              ✅ Weekly challenge updated successfully!
            </p>
          </div>
        )}

        {updateWeeklyChallengeMutation.isError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-medium">
              ❌ Failed to update weekly challenge. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
