import { useState, useEffect, useRef, useCallback } from 'react';
import { LANES, GAME_CONFIG, type Lane, type Entity, type RunState, type RunStats, type PlayerState, type ObstacleType } from './types';

export function useRunnerGame() {
  const [runState, setRunState] = useState<RunState>('ready');
  const [playerState, setPlayerState] = useState<PlayerState>({
    lane: 0,
    isJumping: false,
    isSliding: false,
    jumpProgress: 0,
    slideProgress: 0,
  });
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stats, setStats] = useState<RunStats>({
    distance: 0,
    coinsCollected: 0,
    coinsThisRun: 0,
  });
  const [currentSpeed, setCurrentSpeed] = useState(GAME_CONFIG.BASE_SPEED);

  const lastUpdateRef = useRef<number>(0);
  const lastObstacleSpawnRef = useRef<number>(0);
  const lastCoinSpawnRef = useRef<number>(0);
  const entityIdCounterRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Collision detection
  const checkCollision = useCallback((entity: Entity, player: PlayerState): boolean => {
    if (entity.type !== 'obstacle') return false;
    if (entity.lane !== player.lane) return false;
    if (Math.abs(entity.z) > GAME_CONFIG.COLLISION_THRESHOLD) return false;

    // Jump avoids low obstacles
    if (entity.obstacleType === 'low' && player.isJumping && player.jumpProgress > 0.2) {
      return false;
    }

    // Slide avoids high obstacles
    if (entity.obstacleType === 'high' && player.isSliding && player.slideProgress > 0.2) {
      return false;
    }

    return true;
  }, []);

  // Coin collection
  const checkCoinCollection = useCallback((entity: Entity, player: PlayerState): boolean => {
    if (entity.type !== 'coin') return false;
    if (entity.lane !== player.lane) return false;
    return Math.abs(entity.z) < GAME_CONFIG.COLLISION_THRESHOLD;
  }, []);

  // Spawn entity
  const spawnEntity = useCallback((type: 'obstacle' | 'coin') => {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const id = `${type}-${entityIdCounterRef.current++}`;
    
    const entity: Entity = {
      id,
      type,
      lane,
      z: GAME_CONFIG.SPAWN_DISTANCE,
    };

    if (type === 'obstacle') {
      entity.obstacleType = Math.random() > 0.5 ? 'low' : 'high';
    }

    setEntities(prev => {
      // Cap entity count
      if (prev.length >= GAME_CONFIG.MAX_ENTITIES) {
        return [...prev.slice(1), entity];
      }
      return [...prev, entity];
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (runState !== 'running') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp;
        lastObstacleSpawnRef.current = timestamp;
        lastCoinSpawnRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = timestamp;

      // Update speed (difficulty ramp)
      setCurrentSpeed(prev => Math.min(
        GAME_CONFIG.MAX_SPEED,
        prev + GAME_CONFIG.SPEED_INCREMENT * deltaTime
      ));

      // Update distance
      setStats(prev => ({
        ...prev,
        distance: prev.distance + currentSpeed * deltaTime,
      }));

      // Update player state (jump/slide animations)
      setPlayerState(prev => {
        let newState = { ...prev };

        if (prev.isJumping) {
          const newProgress = prev.jumpProgress + deltaTime / GAME_CONFIG.JUMP_DURATION;
          if (newProgress >= 1) {
            newState.isJumping = false;
            newState.jumpProgress = 0;
          } else {
            newState.jumpProgress = newProgress;
          }
        }

        if (prev.isSliding) {
          const newProgress = prev.slideProgress + deltaTime / GAME_CONFIG.SLIDE_DURATION;
          if (newProgress >= 1) {
            newState.isSliding = false;
            newState.slideProgress = 0;
          } else {
            newState.slideProgress = newProgress;
          }
        }

        return newState;
      });

      // Update entities
      setEntities(prev => {
        const updated = prev.map(entity => ({
          ...entity,
          z: entity.z + currentSpeed * deltaTime,
        }));

        // Remove entities that passed the player
        return updated.filter(entity => entity.z < GAME_CONFIG.DESPAWN_DISTANCE);
      });

      // Check collisions and coin collection
      setEntities(prev => {
        const remaining: Entity[] = [];
        let collided = false;
        let coinsCollectedNow = 0;

        for (const entity of prev) {
          if (checkCollision(entity, playerState)) {
            collided = true;
          } else if (checkCoinCollection(entity, playerState)) {
            coinsCollectedNow++;
          } else {
            remaining.push(entity);
          }
        }

        if (collided) {
          setRunState('gameOver');
        }

        if (coinsCollectedNow > 0) {
          setStats(s => ({
            ...s,
            coinsCollected: s.coinsCollected + coinsCollectedNow,
            coinsThisRun: s.coinsThisRun + coinsCollectedNow,
          }));
        }

        return remaining;
      });

      // Spawn obstacles
      const obstacleInterval = Math.max(
        GAME_CONFIG.MIN_OBSTACLE_INTERVAL,
        GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL - stats.distance / 1000
      );
      if (timestamp - lastObstacleSpawnRef.current > obstacleInterval * 1000) {
        spawnEntity('obstacle');
        lastObstacleSpawnRef.current = timestamp;
      }

      // Spawn coins
      if (timestamp - lastCoinSpawnRef.current > GAME_CONFIG.COIN_SPAWN_INTERVAL * 1000) {
        spawnEntity('coin');
        lastCoinSpawnRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [runState, currentSpeed, playerState, stats.distance, spawnEntity, checkCollision, checkCoinCollection]);

  // Control actions
  const changeLane = useCallback((direction: 'left' | 'right') => {
    if (runState !== 'running') return;
    
    setPlayerState(prev => {
      const currentIndex = LANES.indexOf(prev.lane);
      let newIndex = currentIndex;
      
      if (direction === 'left' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'right' && currentIndex < LANES.length - 1) {
        newIndex = currentIndex + 1;
      }
      
      return { ...prev, lane: LANES[newIndex] };
    });
  }, [runState]);

  const jump = useCallback(() => {
    if (runState !== 'running') return;
    if (playerState.isJumping || playerState.isSliding) return;
    
    setPlayerState(prev => ({
      ...prev,
      isJumping: true,
      jumpProgress: 0,
    }));
  }, [runState, playerState.isJumping, playerState.isSliding]);

  const slide = useCallback(() => {
    if (runState !== 'running') return;
    if (playerState.isJumping || playerState.isSliding) return;
    
    setPlayerState(prev => ({
      ...prev,
      isSliding: true,
      slideProgress: 0,
    }));
  }, [runState, playerState.isJumping, playerState.isSliding]);

  const start = useCallback(() => {
    setRunState('running');
    lastUpdateRef.current = 0;
  }, []);

  const pause = useCallback(() => {
    if (runState === 'running') {
      setRunState('paused');
    } else if (runState === 'paused') {
      setRunState('running');
      lastUpdateRef.current = 0;
    }
  }, [runState]);

  const restart = useCallback(() => {
    setRunState('running');
    setPlayerState({
      lane: 0,
      isJumping: false,
      isSliding: false,
      jumpProgress: 0,
      slideProgress: 0,
    });
    setEntities([]);
    setStats(prev => ({
      distance: 0,
      coinsCollected: prev.coinsCollected,
      coinsThisRun: 0,
    }));
    setCurrentSpeed(GAME_CONFIG.BASE_SPEED);
    lastUpdateRef.current = 0;
    lastObstacleSpawnRef.current = 0;
    lastCoinSpawnRef.current = 0;
    entityIdCounterRef.current = 0;
  }, []);

  return {
    runState,
    playerState,
    entities,
    stats,
    currentSpeed,
    actions: {
      changeLane,
      jump,
      slide,
      start,
      pause,
      restart,
    },
  };
}
