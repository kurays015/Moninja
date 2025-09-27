export const GAME_CONFIG = {
  BASE_SPAWN_INTERVAL: 2500,
  MIN_SPAWN_INTERVAL: 1200,
  SPEED_INCREASE_PER_50_POINTS: 200,
  FRENZY_DURATION: 5000,
  FRENZY_WAVE_INTERVAL: 600,
  FRENZY_WAVE_SIZE: { min: 4, max: 7 },
  NORMAL_WAVE_SIZE: { min: 2, max: 4 },
  BOMB_CHANCE_BASE: 0.15,
  BOMB_CHANCE_MAX: 0.4,
  BOMB_CHANCE_INCREASE: 0.002,
  MONAD_CHANCE: 0.02, // Chance to spawn Monad object (2%)
  JOHN_CHANCE: 0.015, // Chance to spawn John object (1%)
  FRENZY_TRIGGER_INTERVAL: 10,
  FRENZY_TRIGGER_CHANCE: 0.6,
  COLLISION_DISTANCE: 60,
  MIN_SPACING: 120,
  FRENZY_MIN_SPACING: 100,
  SLICE_SOUND_THROTTLE: 50,
  MAX_TRAIL_POINTS: 25,
  MOVEMENT_THRESHOLD: 2,

  // Speed progression system (from slowest to fastest over 1000 points)
  SPEED_PROGRESSION: {
    // Score thresholds and their corresponding speed multipliers
    THRESHOLDS: [
      { score: 0, multiplier: 0.5, message: null }, // Gentle start (50% speed)
      { score: 75, multiplier: 0.6, message: null },
      { score: 150, multiplier: 0.7, message: null },
      { score: 250, multiplier: 0.8, message: null },
      { score: 350, multiplier: 0.9, message: "Speed Increasing!" },
      { score: 450, multiplier: 0.92, message: "Normal Speed!" }, // Normal speed
      { score: 600, multiplier: 0.95, message: "Getting Faster!" },
      { score: 800, multiplier: 0.98, message: "High Speed!" },
      { score: 1000, multiplier: 1, message: "DANGER ZONE!" },
      { score: 1300, multiplier: 1.02, message: "EXTREME SPEED!" },
      { score: 1700, multiplier: 1.05, message: "MAXIMUM VELOCITY!" }, // Maximum speed (165%)
    ],

    // Different scaling for vertical vs horizontal movement
    VERTICAL_SCALE_FACTOR: 0.8, // Vertical speed increases slower than horizontal
    ROTATION_SCALE_FACTOR: 1.2, // Rotation increases faster for visual effect
  },

  // Base velocities (these will be multiplied by speed progression)
  BASE_VELOCITY_X: 8, // Base horizontal velocity range
  BASE_VELOCITY_Y: 18, // Base vertical velocity (upward)
  BASE_ROTATION_SPEED: 5, // Base rotation speed

  // Maximum caps (safety limits)
  MAX_VELOCITY_X: 16, // Maximum horizontal velocity
  MAX_VELOCITY_Y: 25, // Maximum vertical velocity
  MAX_ROTATION_SPEED: 15, // Maximum rotation speed

  // Gravity progression (lower gravity at higher speeds for better arcs)
  GRAVITY_PROGRESSION: {
    BASE: 0.5, // Starting gravity (slower fall)
    MIN: 0.25, // Minimum gravity at high speeds
    SCORE_DIVISOR: 2000, // Score divided by this to reduce gravity
  },

  // Mobile landscape specific adjustments
  MOBILE_LANDSCAPE_BASE_VELOCITY_Y: 20,
  MOBILE_LANDSCAPE_MAX_VELOCITY_Y: 28,
} as const;
