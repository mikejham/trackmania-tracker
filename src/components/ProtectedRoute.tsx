import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log("🛡️ ProtectedRoute state:", {
    user: user?.username || "null",
    isAuthenticated,
    isLoading,
    requireAdmin,
  });

  // Show loading state
  if (isLoading) {
    console.log("⏳ ProtectedRoute: Showing loading state");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("🚫 ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ ProtectedRoute: User authenticated, rendering children");

  // Check admin access if required
  if (requireAdmin) {
    const adminEmails = ["mokedok@gmail.com"];
    const isAdmin = user?.email && adminEmails.includes(user.email);

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-4">
              <h2 className="text-xl font-semibold text-red-400 mb-2">
                Access Denied
              </h2>
              <p className="text-red-300 mb-4">
                You don't have permission to access the admin dashboard.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
