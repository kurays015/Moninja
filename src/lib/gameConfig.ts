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
  MONAD_CHANCE: 0.4,
  FRENZY_TRIGGER_INTERVAL: 10,
  FRENZY_TRIGGER_CHANCE: 0.6,
  COLLISION_DISTANCE: 60,
  MIN_SPACING: 120,
  FRENZY_MIN_SPACING: 100,
  SLICE_SOUND_THROTTLE: 50,
  MAX_TRAIL_POINTS: 25,
  MOVEMENT_THRESHOLD: 2,
  SUBMIT_DEBOUNCE: 2000,
  // New speed progression constants
  BASE_VELOCITY_X: 3, // Starting horizontal speed (very slow)
  MAX_VELOCITY_X: 10, // Maximum horizontal speed
  BASE_VELOCITY_Y: 8, // Starting upward speed (slow)
  MAX_VELOCITY_Y: 16, // Maximum upward speed
  BASE_ROTATION_SPEED: 3, // Starting rotation speed
  MAX_ROTATION_SPEED: 12, // Maximum rotation speed
  SPEED_INCREASE_INTERVAL: 25, // Increase speed every 25 points
  // Mobile landscape specific velocities
  MOBILE_LANDSCAPE_BASE_VELOCITY_Y: 7,
  MOBILE_LANDSCAPE_MAX_VELOCITY_Y: 10,
} as const;
