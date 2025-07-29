import mongoose, { Document, Schema } from "mongoose";

export interface IScore extends Document {
  trackId: string;
  userId: string;
  username: string;
  email: string;
  time: number;
  position: number;
  medal: "Author" | "Gold" | "Silver" | "Bronze" | "None";
  isPersonalBest: boolean;
  screenshot?: string;
  replay?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scoreSchema = new Schema<IScore>(
  {
    trackId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    time: {
      type: Number,
      required: true,
      min: 0,
    },
    position: {
      type: Number,
      default: 0,
    },
    medal: {
      type: String,
      enum: ["Author", "Gold", "Silver", "Bronze", "None"],
      default: "None",
    },
    isPersonalBest: {
      type: Boolean,
      default: true,
    },
    screenshot: {
      type: String,
      default: "",
    },
    replay: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique user-track combinations
scoreSchema.index({ userId: 1, trackId: 1 }, { unique: true });

// Index for leaderboard queries
scoreSchema.index({ trackId: 1, time: 1 });

export const Score = mongoose.model<IScore>("Score", scoreSchema);
