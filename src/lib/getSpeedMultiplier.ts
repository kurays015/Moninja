import { GAME_CONFIG } from "./gameConfig";

export const getSpeedMultiplier = (score: number) => {
  // Progressive speed increase: starts at 1.0, increases by 0.15 every 25 points
  // Caps at 2.5x speed at score 250+
  const speedLevel = Math.floor(score / GAME_CONFIG.SPEED_INCREASE_INTERVAL);
  return Math.min(1.0 + speedLevel * 0.15, 2.5);
};
