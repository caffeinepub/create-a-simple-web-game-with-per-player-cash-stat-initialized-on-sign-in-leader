import { useEffect, useRef, useState } from 'react';
import { LANE_WIDTH, type Entity, type PlayerState } from './types';
import { getCanvasTheme } from './runnerTheme';
import {
  drawDetailedCoin,
  drawDetailedLowObstacle,
  drawDetailedHighObstacle,
  drawDetailedPlayer,
  drawDetailedTrack,
  drawDetailedLaneDividers,
} from './runnerRenderUtils';
import { preloadRunnerAssets, getRunnerAssets } from './runnerAssets';

interface RunnerCanvas3DProps {
  playerState: PlayerState;
  entities: Entity[];
  currentSpeed: number;
}

export default function RunnerCanvas3D({
  playerState,
  entities,
  currentSpeed,
}: RunnerCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const playerStateRef = useRef(playerState);
  const entitiesRef = useRef(entities);
  const currentSpeedRef = useRef(currentSpeed);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Update refs when props change
  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    currentSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  // Preload assets on mount
  useEffect(() => {
    preloadRunnerAssets().then(() => {
      setAssetsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let startTime = Date.now();

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const time = Date.now() - startTime;

      // Get theme colors
      const theme = getCanvasTheme();
      const assets = getRunnerAssets();

      // Clear canvas
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, width, height);

      // Perspective settings
      const vanishingY = height * 0.3;
      const horizonY = height * 0.4;
      const trackWidth = width * 0.6;
      const trackLeft = (width - trackWidth) / 2;
      const trackRight = trackLeft + trackWidth;

      // Draw detailed track
      drawDetailedTrack(
        ctx,
        width,
        height,
        horizonY,
        trackLeft,
        trackRight,
        theme,
        assets.trackTile
      );

      // Draw detailed lane dividers
      drawDetailedLaneDividers(
        ctx,
        width,
        height,
        horizonY,
        trackLeft,
        trackWidth,
        theme,
        time
      );

      // Helper: Convert world position to screen position
      const worldToScreen = (lane: number, z: number): { x: number; y: number; scale: number } => {
        const normalizedZ = Math.max(0, Math.min(1, (z + 50) / 55)); // 0 = far, 1 = near
        const y = horizonY + (height - horizonY) * normalizedZ;
        const scale = 0.2 + normalizedZ * 0.8;
        
        const laneOffset = lane * LANE_WIDTH;
        const perspectiveX = width / 2 + laneOffset * (trackWidth / 9) * normalizedZ;
        
        return { x: perspectiveX, y, scale };
      };

      // Draw entities
      entitiesRef.current.forEach(entity => {
        const pos = worldToScreen(entity.lane, entity.z);
        
        if (entity.type === 'coin') {
          const radius = 15 * pos.scale;
          
          // Try to draw sprite, fallback to procedural
          if (assets.coinSprite && assets.coinSprite.complete) {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.drawImage(
              assets.coinSprite,
              -radius,
              -radius,
              radius * 2,
              radius * 2
            );
            ctx.restore();
          } else {
            drawDetailedCoin(ctx, pos.x, pos.y, radius, theme, time);
          }
        } else if (entity.type === 'obstacle') {
          const size = 30 * pos.scale;
          
          if (entity.obstacleType === 'low') {
            // Try to draw sprite, fallback to procedural
            if (assets.obstacleLow && assets.obstacleLow.complete) {
              ctx.save();
              ctx.translate(pos.x, pos.y);
              ctx.drawImage(
                assets.obstacleLow,
                -size / 2,
                -size / 2,
                size,
                size
              );
              ctx.restore();
            } else {
              drawDetailedLowObstacle(ctx, pos.x, pos.y, size, theme);
            }
          } else {
            // High obstacle
            const height = size * 2;
            if (assets.obstacleHigh && assets.obstacleHigh.complete) {
              ctx.save();
              ctx.translate(pos.x, pos.y - height / 2);
              ctx.drawImage(
                assets.obstacleHigh,
                -size / 2,
                -height / 2,
                size,
                height
              );
              ctx.restore();
            } else {
              drawDetailedHighObstacle(ctx, pos.x, pos.y, size, theme);
            }
          }
        }
      });

      // Draw player
      const playerPos = worldToScreen(playerStateRef.current.lane, 0);
      const playerSize = 40;
      
      // Apply jump offset
      let yOffset = 0;
      if (playerStateRef.current.isJumping) {
        const jumpHeight = Math.sin(playerStateRef.current.jumpProgress * Math.PI) * 60;
        yOffset = -jumpHeight;
      }
      
      // Apply slide scale
      let heightScale = 1;
      if (playerStateRef.current.isSliding) {
        heightScale = 0.5;
      }
      
      const playerWidth = playerSize;
      const playerHeight = playerSize * heightScale;
      const playerY = playerPos.y + yOffset;

      // Try to draw sprite, fallback to procedural
      if (assets.playerSprite && assets.playerSprite.complete) {
        ctx.save();
        ctx.translate(playerPos.x, playerY);
        ctx.drawImage(
          assets.playerSprite,
          -playerWidth / 2,
          -playerHeight,
          playerWidth,
          playerHeight
        );
        ctx.restore();
      } else {
        drawDetailedPlayer(
          ctx,
          playerPos.x,
          playerY,
          playerWidth,
          playerHeight,
          theme,
          playerStateRef.current.isJumping,
          playerStateRef.current.isSliding
        );
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [assetsLoaded]); // Only re-initialize when assets load

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ touchAction: 'none' }}
    />
  );
}
