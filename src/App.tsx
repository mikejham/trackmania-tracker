import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { Dashboard } from "./pages/Dashboard";
import { ChallengesPage } from "./pages/ChallengesPage";
import { TracksPage } from "./pages/TracksPage";
import { GlobalLeaderboard } from "./pages/GlobalLeaderboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <ChallengesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracks"
              element={
                <ProtectedRoute>
                  <TracksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <GlobalLeaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChallengesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
