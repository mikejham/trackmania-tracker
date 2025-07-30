import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Flag, LogOut, BarChart3, Shield } from "lucide-react";
import { useAuth, useLogout } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  // Check if user is admin
  const adminEmails = ["mokedok@gmail.com"];
  const isAdmin = user?.email && adminEmails.includes(user.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20">
      {/* Navigation Header */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-white">
                TrackMania Scoreboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
                  <Shield className="w-4 h-4" />
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
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Welcome back, {user?.username || "Racer"}!
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Ready to dominate the TrackMania leaderboards? Choose your path
            below.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Challenges Card */}
          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30 backdrop-blur-xl hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/30 transition-colors">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Active Challenges
              </CardTitle>
              <p className="text-yellow-300 text-sm">
                Compete in current weekly and campaign challenges
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate("/challenges")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                size="lg"
              >
                View Challenges
              </Button>
            </CardContent>
          </Card>

          {/* Tracks Card */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Flag className="w-8 h-8 text-blue-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Track Library
              </CardTitle>
              <p className="text-blue-300 text-sm">
                Browse and compete on all available tracks
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate("/tracks")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Browse Tracks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-gray-400 text-sm">Active Challenges</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold text-white">25+</div>
              <div className="text-gray-400 text-sm">Available Tracks</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-gray-400 text-sm">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
