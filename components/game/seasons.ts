/**
 * Seasonal Configuration
 *
 * This file manages all seasonal theming for the portfolio game.
 * To change seasons, simply update the CURRENT_SEASON constant.
 *
 * Each season can have:
 * - Player accessories (hats, props, etc.)
 * - Environmental effects (snow, rain, leaves, etc.)
 * - Custom styling or animations
 */

export type SeasonId = "winter" | "spring" | "summer" | "autumn";

export interface SeasonConfig {
  id: SeasonId;
  name: string;
  // Player accessories
  playerAccessory:
    | "none"
    | "santa-hat"
    | "flower-crown"
    | "sunglasses"
    | "scarf";
  // Environmental effects
  showSnowflakes: boolean;
  showFlowers: boolean;
  showSunRays: boolean;
  showLeaves: boolean;
  // You can add more seasonal properties here as needed
  // backgroundColor?: string;
  // musicTheme?: string;
}

// Define all available seasons
export const SEASONS: Record<SeasonId, SeasonConfig> = {
  winter: {
    id: "winter",
    name: "Winter",
    playerAccessory: "none", // Changed from "santa-hat" since Christmas is over
    showSnowflakes: true,
    showFlowers: false,
    showSunRays: false,
    showLeaves: false,
  },
  spring: {
    id: "spring",
    name: "Spring",
    playerAccessory: "flower-crown",
    showSnowflakes: false,
    showFlowers: true,
    showSunRays: false,
    showLeaves: false,
  },
  summer: {
    id: "summer",
    name: "Summer",
    playerAccessory: "sunglasses",
    showSnowflakes: false,
    showFlowers: false,
    showSunRays: true,
    showLeaves: false,
  },
  autumn: {
    id: "autumn",
    name: "Autumn",
    playerAccessory: "scarf",
    showSnowflakes: false,
    showFlowers: false,
    showSunRays: false,
    showLeaves: true,
  },
};

// ============================================
// 🎯 CHANGE THIS TO SWITCH SEASONS
// ============================================
export const CURRENT_SEASON: SeasonId = "spring";

// Helper to get the current season config
export const getCurrentSeason = (): SeasonConfig => {
  return SEASONS[CURRENT_SEASON];
};

// Helper to check if a specific feature is enabled
export const isSeasonalFeatureEnabled = (
  feature: keyof Omit<SeasonConfig, "id" | "name" | "playerAccessory">,
): boolean => {
  return getCurrentSeason()[feature];
};
