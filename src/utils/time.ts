/**
 * Formats time from milliseconds to TrackMania format (MM:SS.mmm)
 * @param timeMs Time in milliseconds
 * @returns Formatted time string
 */
export function formatTime(timeMs: number): string {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = timeMs % 1000;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/**
 * Parses TrackMania time format (very flexible) to milliseconds
 * @param timeString Time string in various formats
 * @returns Time in milliseconds
 */
export function parseTime(timeString: string): number {
  let normalizedTimeString = timeString.trim();

  // Handle seconds-only format (e.g., "23.456" -> "0:23.456")
  if (!normalizedTimeString.includes(":")) {
    if (normalizedTimeString.includes(".")) {
      const [seconds, milliseconds] = normalizedTimeString.split(".");
      const formattedSeconds = seconds.padStart(2, "0");
      const formattedMs = milliseconds.padEnd(3, "0");
      normalizedTimeString = `0:${formattedSeconds}.${formattedMs}`;
    } else {
      const formattedSeconds = normalizedTimeString.padStart(2, "0");
      normalizedTimeString = `0:${formattedSeconds}.000`;
    }
  } else {
    // Handle MM:SS format with auto-padding
    const parts = normalizedTimeString.split(":");
    if (parts.length === 2) {
      const minutes = parts[0].padStart(2, "0");
      const secondsPart = parts[1];

      if (secondsPart.includes(".")) {
        const [seconds, milliseconds] = secondsPart.split(".");
        const formattedSeconds = seconds.padStart(2, "0");
        const formattedMs = milliseconds.padEnd(3, "0");
        normalizedTimeString = `${minutes}:${formattedSeconds}.${formattedMs}`;
      } else {
        const formattedSeconds = secondsPart.padStart(2, "0");
        normalizedTimeString = `${minutes}:${formattedSeconds}.000`;
      }
    }
  }

  const regex = /^(\d{1,2}):(\d{2})\.(\d{3})$/;
  const match = normalizedTimeString.match(regex);

  if (!match) {
    throw new Error(
      "Invalid time format. Expected MM:SS.mmm (e.g., 01:23.456)"
    );
  }

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const milliseconds = parseInt(match[3], 10);

  return minutes * 60 * 1000 + seconds * 1000 + milliseconds;
}

/**
 * Calculates time difference and returns formatted string with improvement indicator
 * @param currentTime Current time in milliseconds
 * @param previousTime Previous time in milliseconds
 * @returns Object with difference and improvement status
 */
export function getTimeDifference(
  currentTime: number,
  previousTime: number
): { difference: string; isImprovement: boolean } {
  const diff = Math.abs(currentTime - previousTime);
  const isImprovement = currentTime < previousTime;

  return {
    difference: formatTime(diff),
    isImprovement,
  };
}

/**
 * Determines medal type based on time and medal thresholds
 * @param time Time in milliseconds
 * @param thresholds Medal time thresholds
 * @returns Medal type
 */
export function getMedalForTime(
  time: number,
  thresholds: {
    authorTime?: number;
    goldTime?: number;
    silverTime?: number;
    bronzeTime?: number;
  }
): "Author" | "Gold" | "Silver" | "Bronze" | "None" {
  if (thresholds.authorTime && time <= thresholds.authorTime) {
    return "Author";
  }
  if (thresholds.goldTime && time <= thresholds.goldTime) {
    return "Gold";
  }
  if (thresholds.silverTime && time <= thresholds.silverTime) {
    return "Silver";
  }
  if (thresholds.bronzeTime && time <= thresholds.bronzeTime) {
    return "Bronze";
  }
  return "None";
}

/**
 * Converts relative time to human readable format
 * @param date Date to convert
 * @returns Human readable relative time
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Validates time string format (very flexible)
 * @param timeString Time string to validate
 * @returns True if valid
 */
export function isValidTimeFormat(timeString: string): boolean {
  const trimmed = timeString.trim();

  if (!trimmed) return false;

  // Allow formats like:
  // "1:23", "1:23.4", "1:23.45", "1:23.456"
  // "23", "23.4", "23.45", "23.456" (treats as seconds)
  // "1:2", "1:2.3" (auto-pads)
  const flexibleRegex = /^(\d{1,2}:)?(\d{1,2})(\.\d{1,3})?$/;
  return flexibleRegex.test(trimmed);
}
