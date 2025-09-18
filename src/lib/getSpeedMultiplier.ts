import { GAME_CONFIG } from "./gameConfig";

// New helper function for vertical speed scaling (more conservative)
export const getVerticalSpeedMultiplier = (score: number) => {
  // Much more conservative vertical speed increase
  // Starts at 1.0, increases by 0.05 every 50 points
  // Caps at 1.5x speed at score 500+
  const speedLevel = Math.floor(
    score / (GAME_CONFIG.SPEED_INCREASE_INTERVAL * 2)
  );
  return Math.min(1.0 + speedLevel * 0.05, 1.5);
};

// Alternative: Modified original speed multiplier function
export const getSpeedMultiplierBalanced = (score: number) => {
  // More gradual and reasonable speed increase
  // Starts at 1.0, increases by 0.08 every 25 points
  // Caps at 1.8x speed at score 250+
  const speedLevel = Math.floor(score / GAME_CONFIG.SPEED_INCREASE_INTERVAL);
  return Math.min(1.0 + speedLevel * 0.08, 1.8);
};
