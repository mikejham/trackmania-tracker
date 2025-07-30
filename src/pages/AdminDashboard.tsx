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
  Plus,
  Trash2,
  Calendar,
  MapPin,
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

interface NewTrackForm {
  name: string;
  mapType: "Campaign" | "Weekly";
  difficulty: "Beginner" | "Intermediate" | "Expert";
  authorTime: number;
  goldTime: number;
  silverTime: number;
  bronzeTime: number;
  weekNumber?: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [showAddTrackForm, setShowAddTrackForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"weekly-challenge" | "tracks">(
    "weekly-challenge"
  );
  const { user } = useAuth();

  // New track form state
  const [newTrack, setNewTrack] = useState<NewTrackForm>({
    name: "",
    mapType: "Campaign",
    difficulty: "Intermediate",
    authorTime: 45000,
    goldTime: 50000,
    silverTime: 55000,
    bronzeTime: 60000,
    weekNumber: undefined,
  });

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

  // Mutation to add new track
  const addTrackMutation = useMutation({
    mutationFn: async (trackData: NewTrackForm) => {
      const response = await apiClient.addTrack(trackData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      setNewTrack({
        name: "",
        mapType: "Campaign",
        difficulty: "Intermediate",
        authorTime: 45000,
        goldTime: 50000,
        silverTime: 55000,
        bronzeTime: 60000,
        weekNumber: undefined,
      });
      setShowAddTrackForm(false);
    },
  });

  // Mutation to delete track
  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await apiClient.deleteTrack(trackId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
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

  const handleAddTrack = () => {
    addTrackMutation.mutate(newTrack);
  };

  const handleDeleteTrack = (trackId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone."
      )
    ) {
      deleteTrackMutation.mutate(trackId);
    }
  };

  const handleNewTrackChange = (field: keyof NewTrackForm, value: any) => {
    setNewTrack((prev) => ({ ...prev, [field]: value }));
  };

  // Filter tracks to show only weekly tracks
  const weeklyTracks =
    tracksData?.filter((track: Track) => track.mapType === "Weekly") || [];

  const campaignTracks =
    tracksData?.filter((track: Track) => track.mapType === "Campaign") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/60 text-sm">
                Logged in as: {user?.email}
              </p>
            </div>
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 p-1 rounded-lg backdrop-blur mb-8">
          <button
            onClick={() => setActiveTab("weekly-challenge")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "weekly-challenge"
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Weekly Challenge
          </button>
          <button
            onClick={() => setActiveTab("tracks")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "tracks"
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Track Management
          </button>
        </div>

        {/* Weekly Challenge Tab */}
        {activeTab === "weekly-challenge" && (
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
                    className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{
                      backgroundColor: "#1f2937",
                      color: "white",
                    }}
                  >
                    <option
                      value=""
                      style={{ backgroundColor: "#1f2937", color: "white" }}
                    >
                      Select a weekly track...
                    </option>
                    {weeklyTracks.map((track: Track) => (
                      <option
                        key={track.id}
                        value={track.id}
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
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
                    {campaignTracks.length}
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
        )}

        {/* Track Management Tab */}
        {activeTab === "tracks" && (
          <div className="space-y-8">
            {/* Add New Track Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Add New Track
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddTrackForm(!showAddTrackForm)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {showAddTrackForm ? "Cancel" : "Add Track"}
                </button>
              </div>

              {showAddTrackForm && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Track Name
                      </label>
                      <input
                        type="text"
                        value={newTrack.name}
                        onChange={(e) =>
                          handleNewTrackChange("name", e.target.value)
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter track name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Track Type
                      </label>
                      <select
                        value={newTrack.mapType}
                        onChange={(e) =>
                          handleNewTrackChange("mapType", e.target.value)
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        <option
                          value="Campaign"
                          style={{ backgroundColor: "#1f2937", color: "white" }}
                        >
                          Campaign
                        </option>
                        <option
                          value="Weekly"
                          style={{ backgroundColor: "#1f2937", color: "white" }}
                        >
                          Weekly
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Difficulty
                      </label>
                      <select
                        value={newTrack.difficulty}
                        onChange={(e) =>
                          handleNewTrackChange("difficulty", e.target.value)
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        style={{ backgroundColor: "#1f2937", color: "white" }}
                      >
                        <option
                          value="Beginner"
                          style={{ backgroundColor: "#1f2937", color: "white" }}
                        >
                          Beginner
                        </option>
                        <option
                          value="Intermediate"
                          style={{ backgroundColor: "#1f2937", color: "white" }}
                        >
                          Intermediate
                        </option>
                        <option
                          value="Expert"
                          style={{ backgroundColor: "#1f2937", color: "white" }}
                        >
                          Expert
                        </option>
                      </select>
                    </div>

                    {newTrack.mapType === "Weekly" && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Week Number
                        </label>
                        <input
                          type="number"
                          value={newTrack.weekNumber || ""}
                          onChange={(e) =>
                            handleNewTrackChange(
                              "weekNumber",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="e.g., 34"
                          min="1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Author Time (ms)
                      </label>
                      <input
                        type="number"
                        value={newTrack.authorTime}
                        onChange={(e) =>
                          handleNewTrackChange(
                            "authorTime",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="45000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Gold Time (ms)
                      </label>
                      <input
                        type="number"
                        value={newTrack.goldTime}
                        onChange={(e) =>
                          handleNewTrackChange(
                            "goldTime",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Silver Time (ms)
                      </label>
                      <input
                        type="number"
                        value={newTrack.silverTime}
                        onChange={(e) =>
                          handleNewTrackChange(
                            "silverTime",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="55000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Bronze Time (ms)
                      </label>
                      <input
                        type="number"
                        value={newTrack.bronzeTime}
                        onChange={(e) =>
                          handleNewTrackChange(
                            "bronzeTime",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-3 bg-gray-800 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="60000"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddTrack}
                    disabled={!newTrack.name || addTrackMutation.isPending}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {addTrackMutation.isPending ? "Adding..." : "Add Track"}
                  </button>
                </div>
              )}
            </div>

            {/* Track Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Campaign Tracks */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Campaign Tracks
                  </h2>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
                    {campaignTracks.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {campaignTracks.map((track: Track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{track.name}</p>
                        <p className="text-white/60 text-sm">
                          {track.difficulty}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        disabled={deleteTrackMutation.isPending}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {campaignTracks.length === 0 && (
                    <p className="text-white/60 text-center py-4">
                      No campaign tracks found
                    </p>
                  )}
                </div>
              </div>

              {/* Weekly Tracks */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Weekly Tracks
                  </h2>
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm">
                    {weeklyTracks.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {weeklyTracks.map((track: Track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{track.name}</p>
                        <p className="text-white/60 text-sm">
                          Week {track.weekNumber} • {track.difficulty}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        disabled={deleteTrackMutation.isPending}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {weeklyTracks.length === 0 && (
                    <p className="text-white/60 text-center py-4">
                      No weekly tracks found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        {addTrackMutation.isSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-medium">
              ✅ Track added successfully!
            </p>
          </div>
        )}

        {addTrackMutation.isError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-medium">
              ❌ Failed to add track. Please try again.
            </p>
          </div>
        )}

        {deleteTrackMutation.isSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-medium">
              ✅ Track deleted successfully!
            </p>
          </div>
        )}

        {deleteTrackMutation.isError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-medium">
              ❌ Failed to delete track. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
