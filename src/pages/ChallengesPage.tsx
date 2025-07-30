import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Trophy, LogOut, Flag, BarChart3, Menu, X } from "lucide-react";
import { useAuth, useLogout } from "../hooks/useAuth";
import { apiClient } from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { WeeklyChallengeCard } from "../components/WeeklyChallengeCard";
import { CampaignChallengeCard } from "../components/CampaignChallengeCard";
import { SubmitTimeModal } from "../components/SubmitTimeModal";

export const ChallengesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [defaultTrackForModal, setDefaultTrackForModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Check if user is admin
  const adminEmails = ["mokedok@gmail.com"];
  const isAdmin = user?.email && adminEmails.includes(user.email);

  // Fetch weekly challenge
  const { data: weeklyChallengeData } = useQuery({
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

  // Fetch campaign challenge
  const { data: campaignChallengeData } = useQuery({
    queryKey: ["campaign-challenge"],
    queryFn: async () => {
      const response = await apiClient.getCampaignChallenge();
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch campaign challenge leaderboard
  const { data: campaignChallengeLeaderboardData } = useQuery({
    queryKey: ["leaderboard", "campaign-challenge"],
    queryFn: async () => {
      try {
        const response = await apiClient.getLeaderboard("campaign-challenge");
        return response.data.data;
      } catch (error) {
        console.error("Failed to fetch campaign challenge leaderboard:", error);
        return null;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const campaignChallengeLeaderboard = campaignChallengeLeaderboardData || {
    trackId: "campaign-challenge",
    track: campaignChallengeData?.track || {
      id: "campaign-challenge",
      name: "Campaign Challenge",
      author: "Unknown",
      difficulty: "Intermediate" as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mapType: "Campaign Challenge" as const,
    },
    scores: [],
    totalPlayers: 0,
    lastUpdated: new Date().toISOString(),
  };

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
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
                Please log in to access the challenges.
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
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-white">
                TrackMania Challenges
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => navigate("/tracks")}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Track Library</span>
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

            {/* Mobile Hamburger Menu */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="sm:hidden mb-4 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">
              <div className="p-4 space-y-3">
                <button
                  onClick={() => handleNavigation("/tracks")}
                  className="flex items-center space-x-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Flag className="w-5 h-5" />
                  <span className="font-medium">Track Library</span>
                </button>
                <button
                  onClick={() => handleNavigation("/leaderboard")}
                  className="flex items-center space-x-3 w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Global Leaderboards</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavigation("/admin")}
                    className="flex items-center space-x-3 w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <span className="font-medium">Admin Dashboard</span>
                  </button>
                )}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="flex items-center space-x-3 w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <div className="sm:hidden flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-white/10">
            <Button
              onClick={() => navigate("/challenges")}
              variant="ghost"
              size="sm"
              className="text-white bg-white/10 hover:bg-white/20 flex-1 text-xs"
            >
              <Trophy className="w-3 h-3 mr-1" />
              Challenges
            </Button>
            <Button
              onClick={() => navigate("/tracks")}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 flex-1 text-xs"
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
            Ready to take on the current challenges? Show us what you've got!
          </p>
        </div>

        {/* Challenges Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Active Challenges
              </h3>
              <p className="text-gray-400 text-sm">
                Compete in current challenges
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Challenge Card */}
            {weeklyChallengeData && weeklyChallengeData.track && (
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
            )}

            {/* Campaign Challenge Card */}
            {campaignChallengeData && campaignChallengeData.track && (
              <CampaignChallengeCard
                track={{
                  ...campaignChallengeData.track,
                  author: "Unknown",
                  difficulty: "Intermediate" as const,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  mapType:
                    (campaignChallengeData.track.mapType as any) ||
                    ("Campaign Challenge" as const),
                }}
                onParticipate={() => {
                  setDefaultTrackForModal({
                    id: campaignChallengeData.track.id,
                    name: campaignChallengeData.track.name,
                  });
                  setIsModalOpen(true);
                }}
                participantCount={campaignChallengeData.participantCount}
                topScores={campaignChallengeLeaderboard.scores}
              />
            )}
          </div>
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
