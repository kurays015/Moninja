import { GAME_CONFIG } from "./gameConfig";

export function calculateObjectSpeed(
  score: number,
  frenzyMode: boolean = false
) {
  const config = GAME_CONFIG.OBJECT_SPEED;

  if (frenzyMode) {
    return {
      horizontalSpeed: config.FRENZY_HORIZONTAL_SPEED,
      verticalSpeed: config.FRENZY_VERTICAL_SPEED,
      rotationSpeed: config.FRENZY_ROTATION_SPEED,
      gravity: config.FRENZY_GRAVITY,
    };
  }

  // Calculate progression factor (0 to 1, where 1 = normal speed reached)
  const progressionFactor = Math.min(
    score / config.SPEED_PROGRESSION.POINTS_TO_NORMAL_SPEED,
    1
  );

  // Additional speed boost after reaching normal speed
  const additionalSpeedFactor = Math.min(
    Math.max(
      0,
      (score - config.SPEED_PROGRESSION.POINTS_TO_NORMAL_SPEED) /
        config.SPEED_PROGRESSION.SPEED_INCREASE_INTERVAL
    ) * 0.1,
    config.SPEED_PROGRESSION.MAX_SPEED_MULTIPLIER - 1
  );

  const totalSpeedFactor = progressionFactor + additionalSpeedFactor;

  // Interpolate between initial and normal speeds
  const horizontalSpeed = {
    min:
      config.INITIAL_HORIZONTAL_SPEED.min +
      (config.NORMAL_HORIZONTAL_SPEED.min -
        config.INITIAL_HORIZONTAL_SPEED.min) *
        totalSpeedFactor,
    max:
      config.INITIAL_HORIZONTAL_SPEED.max +
      (config.NORMAL_HORIZONTAL_SPEED.max -
        config.INITIAL_HORIZONTAL_SPEED.max) *
        totalSpeedFactor,
  };

  const verticalSpeed = {
    min:
      config.INITIAL_VERTICAL_SPEED.min +
      (config.NORMAL_VERTICAL_SPEED.min - config.INITIAL_VERTICAL_SPEED.min) *
        totalSpeedFactor,
    max:
      config.INITIAL_VERTICAL_SPEED.max +
      (config.NORMAL_VERTICAL_SPEED.max - config.INITIAL_VERTICAL_SPEED.max) *
        totalSpeedFactor,
  };

  const rotationSpeed = {
    min:
      config.INITIAL_ROTATION_SPEED.min +
      (config.NORMAL_ROTATION_SPEED.min - config.INITIAL_ROTATION_SPEED.min) *
        totalSpeedFactor,
    max:
      config.INITIAL_ROTATION_SPEED.max +
      (config.NORMAL_ROTATION_SPEED.max - config.INITIAL_ROTATION_SPEED.max) *
        totalSpeedFactor,
  };

  const gravity =
    config.INITIAL_GRAVITY +
    (config.NORMAL_GRAVITY - config.INITIAL_GRAVITY) * totalSpeedFactor;

  return {
    horizontalSpeed,
    verticalSpeed,
    rotationSpeed,
    gravity,
    progressionFactor: Math.min(
      progressionFactor + additionalSpeedFactor,
      config.SPEED_PROGRESSION.MAX_SPEED_MULTIPLIER
    ),
  };
}
