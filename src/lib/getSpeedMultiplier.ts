import { GAME_CONFIG } from "./gameConfig";

// Main speed multiplier function with smooth interpolation
export const getSpeedMultiplier = (score: number): number => {
  const thresholds = GAME_CONFIG.SPEED_PROGRESSION.THRESHOLDS;

  // Find the appropriate threshold range
  for (let i = 0; i < thresholds.length - 1; i++) {
    const current = thresholds[i];
    const next = thresholds[i + 1];

    if (score >= current.score && score < next.score) {
      // Linear interpolation between thresholds for smooth progression
      const progress = (score - current.score) / (next.score - current.score);
      return (
        current.multiplier + (next.multiplier - current.multiplier) * progress
      );
    }
  }

  // If score is beyond max threshold, return max multiplier
  const maxThreshold = thresholds[thresholds.length - 1];
  if (score >= maxThreshold.score) {
    return maxThreshold.multiplier;
  }

  // Fallback to minimum
  return thresholds[0].multiplier;
};

// Specialized multipliers for different aspects
export const getHorizontalSpeedMultiplier = (score: number): number => {
  return getSpeedMultiplier(score);
};

export const getVerticalSpeedMultiplier = (score: number): number => {
  // Vertical speed increases slower for better playability
  const baseMultiplier = getSpeedMultiplier(score);
  const scaleFactor = GAME_CONFIG.SPEED_PROGRESSION.VERTICAL_SCALE_FACTOR;

  // Blend between 1.0 and the base multiplier using scale factor
  return 1.0 + (baseMultiplier - 1.0) * scaleFactor;
};

export const getRotationSpeedMultiplier = (score: number): number => {
  // Rotation can increase faster for visual effect
  const baseMultiplier = getSpeedMultiplier(score);
  const scaleFactor = GAME_CONFIG.SPEED_PROGRESSION.ROTATION_SCALE_FACTOR;

  return Math.min(
    baseMultiplier * scaleFactor,
    3.0 // Cap rotation multiplier at 3x
  );
};

export const getGravityMultiplier = (score: number): number => {
  // Gravity decreases slightly as speed increases for better arcs
  const { BASE, MIN, SCORE_DIVISOR } = GAME_CONFIG.GRAVITY_PROGRESSION;
  const reduction = Math.min(score / SCORE_DIVISOR, 0.5);
  return Math.max(BASE - reduction, MIN);
};
