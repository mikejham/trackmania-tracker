import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { Score, Track, User } from "../types";

// Types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Leaderboard {
  trackId: string;
  track: Track;
  scores: Score[];
  totalPlayers: number;
  lastUpdated: string;
  error?: string; // Optional error property for bulk responses
}

export interface WeeklyChallenge {
  track: Track;
  participantCount: number;
  weekProgress: number;
  weekProgressText: string;
}

export interface Stats {
  totalUsers: number;
  totalRecords: number;
  bestTime: string;
}

export interface ScoreSubmissionForm {
  trackId: string;
  time: number;
  screenshot?: string;
  replay?: string;
}

export interface GlobalLeaderboard {
  globalRankings: GlobalRanking[];
  weeklyChampions: WeeklyChampion[];
  mostActive: MostActivePlayer[];
  stats: GlobalStats;
}

export interface GlobalRanking {
  username: string;
  firstPlaceWins: number;
  weeklyWins: number;
  totalTimes: number;
  personalBests: PersonalBest[];
}

export interface WeeklyChampion {
  username: string;
  weeklyWins: number;
  firstPlaceWins: number;
  totalTimes: number;
}

export interface MostActivePlayer {
  username: string;
  totalTimes: number;
  firstPlaceWins: number;
  weeklyWins: number;
}

export interface PersonalBest {
  trackId: string;
  time: number;
  trackName: string;
}

export interface GlobalStats {
  totalPlayers: number;
  totalTracks: number;
  totalScores: number;
  lastUpdated: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const baseURL = apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;

    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem("auth-token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Clear invalid token
          localStorage.removeItem("auth-token");
          localStorage.removeItem("auth-user");
          // Redirect to login if not already there
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register"
          ) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginForm): Promise<AxiosResponse<AuthResponse>> {
    return this.client.post("/auth/login", credentials);
  }

  async register(userData: RegisterForm): Promise<AxiosResponse<AuthResponse>> {
    return this.client.post("/auth/register", userData);
  }

  async logout(): Promise<
    AxiosResponse<{ success: boolean; message: string }>
  > {
    return this.client.post("/auth/logout");
  }

  async getCurrentUser(): Promise<
    AxiosResponse<{ success: boolean; data: { user: User } }>
  > {
    return this.client.get("/auth/me");
  }

  async getStats(): Promise<AxiosResponse<{ success: boolean; data: Stats }>> {
    return this.client.get("/auth/stats");
  }

  // Track methods
  async getTracks(): Promise<
    AxiosResponse<{ success: boolean; data: Track[] }>
  > {
    return this.client.get("/tracks");
  }

  async getTracksByWeek(weekNumber: number): Promise<
    AxiosResponse<{
      success: boolean;
      data: Track[];
      week: number;
      trackCount: number;
    }>
  > {
    return this.client.get(`/tracks/week/${weekNumber}`);
  }

  async getLeaderboard(
    trackId: string
  ): Promise<AxiosResponse<{ success: boolean; data: Leaderboard }>> {
    return this.client.get(`/tracks/${trackId}/leaderboard`);
  }

  async getBulkLeaderboards(trackIds: string[]): Promise<
    AxiosResponse<{
      success: boolean;
      data: {
        leaderboards: Leaderboard[];
        summary: { total: number; successful: number; failed: number };
      };
    }>
  > {
    const trackIdsParam = trackIds.join(",");
    return this.client.get(
      `/tracks/bulk-leaderboards?trackIds=${trackIdsParam}`
    );
  }

  async getWeeklyChallenge(): Promise<
    AxiosResponse<{ success: boolean; data: WeeklyChallenge }>
  > {
    return this.client.get("/tracks/weekly-challenge");
  }

  async updateWeeklyChallenge(trackId: string) {
    return this.client.put("/tracks/weekly-challenge", { trackId });
  }

  async addTrack(trackData: {
    name: string;
    mapType: "Campaign" | "Weekly";
    difficulty: "Beginner" | "Intermediate" | "Expert";
    authorTime: number;
    goldTime: number;
    silverTime: number;
    bronzeTime: number;
    weekNumber?: number;
  }) {
    return this.client.post("/tracks", trackData);
  }

  async deleteTrack(trackId: string) {
    return this.client.delete(`/tracks/${trackId}`);
  }

  async getGlobalLeaderboard(): Promise<
    AxiosResponse<{ success: boolean; data: GlobalLeaderboard }>
  > {
    return this.client.get("/tracks/global-leaderboard");
  }

  // Score methods
  async submitScore(
    scoreData: ScoreSubmissionForm
  ): Promise<AxiosResponse<{ success: boolean; data: { score: Score } }>> {
    return this.client.post("/scores/submit", scoreData);
  }

  async deleteScore(trackId: string): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      data: { deletedScore: Score };
    }>
  > {
    return this.client.delete(`/scores/track/${trackId}`);
  }

  async getMyScores(): Promise<
    AxiosResponse<{ success: boolean; data: { scores: Score[] } }>
  > {
    return this.client.get("/scores/my-scores");
  }

  async getTrackScores(trackId: string): Promise<
    AxiosResponse<{
      success: boolean;
      data: { trackId: string; scores: Score[] };
    }>
  > {
    return this.client.get(`/scores/track/${trackId}`);
  }

  // Health check
  async healthCheck(): Promise<
    AxiosResponse<{ success: boolean; message: string }>
  > {
    return this.client.get("/health");
  }
}

export const apiClient = new ApiClient();
