import type { Score } from "../types";

/**
 * Returns the appropriate CSS class for medal colors
 * @param medal Medal type
 * @returns Tailwind CSS class string
 */
export function getMedalColorClass(
  medal: "Author" | "Gold" | "Silver" | "Bronze" | "None"
): string {
  const medalColors = {
    Author: "text-trackmania-green",
    Gold: "text-trackmania-gold",
    Silver: "text-trackmania-silver",
    Bronze: "text-trackmania-bronze",
    None: "text-gray-500",
  } as const;

  return medalColors[medal];
}

/**
 * Returns the appropriate background CSS class for medal colors
 * @param medal Medal type
 * @returns Tailwind CSS class string
 */
export function getMedalBgClass(
  medal: "Author" | "Gold" | "Silver" | "Bronze" | "None"
): string {
  const medalBgColors = {
    Author: "bg-trackmania-green/10 border-trackmania-green/20",
    Gold: "bg-trackmania-gold/10 border-trackmania-gold/20",
    Silver: "bg-trackmania-silver/10 border-trackmania-silver/20",
    Bronze: "bg-trackmania-bronze/10 border-trackmania-bronze/20",
    None: "bg-gray-100 border-gray-200",
  } as const;

  return medalBgColors[medal];
}

/**
 * Returns medal emoji for display
 * @param medal Medal type
 * @returns Emoji string
 */
export function getMedalEmoji(
  medal: "Author" | "Gold" | "Silver" | "Bronze" | "None"
): string {
  const medalEmojis = {
    Author: "🏆",
    Gold: "🥇",
    Silver: "🥈",
    Bronze: "🥉",
    None: "⚪",
  } as const;

  return medalEmojis[medal];
}

/**
 * Returns medal priority for sorting (lower number = better medal)
 * @param medal Medal type
 * @returns Priority number
 */
export function getMedalPriority(
  medal: "Author" | "Gold" | "Silver" | "Bronze" | "None"
): number {
  const medalPriorities = {
    Author: 1,
    Gold: 2,
    Silver: 3,
    Bronze: 4,
    None: 5,
  } as const;

  return medalPriorities[medal];
}

/**
 * Sorts scores by medal priority and then by time
 * @param scores Array of scores
 * @returns Sorted scores
 */
export function sortScoresByMedal(scores: Score[]): Score[] {
  return [...scores].sort((a, b) => {
    const aPriority = getMedalPriority(a.medal);
    const bPriority = getMedalPriority(b.medal);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.time - b.time;
  });
}

/**
 * Gets medal distribution from scores
 * @param scores Array of scores
 * @returns Medal count object
 */
export function getMedalDistribution(scores: Score[]): {
  author: number;
  gold: number;
  silver: number;
  bronze: number;
  none: number;
} {
  return scores.reduce(
    (acc, score) => {
      switch (score.medal) {
        case "Author":
          acc.author++;
          break;
        case "Gold":
          acc.gold++;
          break;
        case "Silver":
          acc.silver++;
          break;
        case "Bronze":
          acc.bronze++;
          break;
        case "None":
          acc.none++;
          break;
      }
      return acc;
    },
    { author: 0, gold: 0, silver: 0, bronze: 0, none: 0 }
  );
}
