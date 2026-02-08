// Runner game domain types and constants

export const LANES = [-1, 0, 1] as const; // Left, Center, Right
export type Lane = typeof LANES[number];

export const LANE_WIDTH = 3; // World units between lanes

export type ObstacleType = 'low' | 'high';
export type EntityType = 'obstacle' | 'coin';

export interface Entity {
  id: string;
  type: EntityType;
  lane: Lane;
  z: number; // Position along track (negative = ahead of player)
  obstacleType?: ObstacleType; // Only for obstacles
}

export type RunState = 'ready' | 'running' | 'paused' | 'gameOver';

export interface RunStats {
  distance: number; // In meters
  coinsCollected: number;
  coinsThisRun: number;
}

export interface PlayerState {
  lane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  jumpProgress: number; // 0-1
  slideProgress: number; // 0-1
}

// Tuning parameters
export const GAME_CONFIG = {
  BASE_SPEED: 15, // Units per second
  SPEED_INCREMENT: 0.5, // Speed increase per second
  MAX_SPEED: 35,
  
  SPAWN_DISTANCE: -50, // How far ahead to spawn entities
  DESPAWN_DISTANCE: 5, // How far behind player to remove entities
  
  OBSTACLE_SPAWN_INTERVAL: 1.5, // Seconds between obstacle spawns (decreases over time)
  MIN_OBSTACLE_INTERVAL: 0.8,
  COIN_SPAWN_INTERVAL: 0.8, // Seconds between coin spawns
  
  JUMP_DURATION: 0.5, // Seconds
  SLIDE_DURATION: 0.4, // Seconds
  
  COLLISION_THRESHOLD: 1.5, // Distance for collision detection
  
  MAX_ENTITIES: 50, // Cap to prevent memory issues
};
