export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  name: string;
  author: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Lunatic";
  authorTime?: number; // in milliseconds
  goldTime?: number;
  silverTime?: number;
  bronzeTime?: number;
  mapType: "Weekly" | "Campaign" | "Custom" | "Weekly Challenge";
  isActive: boolean;
  weekNumber?: number; // For weekly challenges
  challengeDescription?: string; // For weekly challenges
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  userId: string;
  trackId: string;
  username: string;
  email: string;
  time: number; // in milliseconds
  position: number;
  medal: "Author" | "Gold" | "Silver" | "Bronze" | "None";
  isPersonalBest: boolean;
  screenshot?: string;
  replay?: string;
  user?: User;
  track?: Track;
  createdAt: string;
  updatedAt: string;
}

export interface Leaderboard {
  trackId: string;
  track: Track;
  scores: Score[];
  totalPlayers: number;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "NEW_PERSONAL_BEST"
    | "BEATEN_BY_FRIEND"
    | "NEW_WEEKLY_MAP"
    | "ACHIEVEMENT";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface UserStats {
  userId: string;
  totalRaces: number;
  personalBests: number;
  averagePosition: number;
  totalPlayTime: number; // in milliseconds
  favoriteEnvironment: string;
  medals: {
    author: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  weeklyWins: number;
  campaignProgress: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface ScoreSubmissionForm {
  trackId: string;
  time: number;
  screenshot?: File;
  replay?: File;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface UserRegistrationForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginForm {
  email: string;
  password: string;
}

// Utility types
export type MedalColor = {
  Author: "text-trackmania-green";
  Gold: "text-trackmania-gold";
  Silver: "text-trackmania-silver";
  Bronze: "text-trackmania-bronze";
  None: "text-gray-500";
};

export type SortBy = "time" | "position" | "medal" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface SortOptions {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

// Real-time updates
export interface RealtimeUpdate {
  type: "SCORE_UPDATE" | "NEW_SCORE" | "USER_ONLINE" | "USER_OFFLINE";
  data: any;
  timestamp: Date;
}
