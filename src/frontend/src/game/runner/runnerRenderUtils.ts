// High-detail procedural rendering utilities for runner game objects

import type { CanvasTheme } from './runnerTheme';
import { adjustBrightness } from './runnerTheme';

/**
 * Draw a detailed coin with multiple layers, highlights, and shimmer effect
 */
export function drawDetailedCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  theme: CanvasTheme,
  time: number
): void {
  const shimmer = Math.sin(time * 0.003) * 0.15 + 0.85; // Subtle shimmer 0.7-1.0
  
  ctx.save();
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x + radius * 0.1, y + radius * 0.1, radius * 0.95, radius * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Base coin body (gradient)
  const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  gradient.addColorStop(0, adjustBrightness(theme.primary, 40));
  gradient.addColorStop(0.6, theme.primary);
  gradient.addColorStop(1, adjustBrightness(theme.primary, -30));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Rim/edge highlight
  ctx.strokeStyle = adjustBrightness(theme.primary, 60);
  ctx.lineWidth = radius * 0.15;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner detail circle
  ctx.strokeStyle = adjustBrightness(theme.primary, -20);
  ctx.lineWidth = radius * 0.08;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  
  // Specular highlight (shimmer)
  const highlightGradient = ctx.createRadialGradient(
    x - radius * 0.4,
    y - radius * 0.4,
    0,
    x - radius * 0.4,
    y - radius * 0.4,
    radius * 0.5
  );
  highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * shimmer})`);
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Accent ring
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = radius * 0.06;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.95, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw a detailed low obstacle with shading and depth
 */
export function drawDetailedLowObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  theme: CanvasTheme
): void {
  ctx.save();
  
  const halfSize = size / 2;
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(x - halfSize + size * 0.1, y - halfSize + size * 0.1, size, size);
  
  // Main body gradient
  const gradient = ctx.createLinearGradient(x - halfSize, y - halfSize, x + halfSize, y + halfSize);
  gradient.addColorStop(0, '#ef4444');
  gradient.addColorStop(0.5, '#dc2626');
  gradient.addColorStop(1, '#b91c1c');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x - halfSize, y - halfSize, size, size);
  
  // Top highlight
  ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
  ctx.fillRect(x - halfSize, y - halfSize, size, size * 0.2);
  
  // Edge shading
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - halfSize, y - halfSize, size, size);
  
  // Inner detail lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - halfSize * 0.6, y - halfSize);
  ctx.lineTo(x - halfSize * 0.6, y + halfSize);
  ctx.moveTo(x + halfSize * 0.6, y - halfSize);
  ctx.lineTo(x + halfSize * 0.6, y + halfSize);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw a detailed high obstacle with shading and depth
 */
export function drawDetailedHighObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  theme: CanvasTheme
): void {
  ctx.save();
  
  const halfSize = size / 2;
  const height = size * 2;
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(x - halfSize + size * 0.1, y - height + size * 0.1, size, height);
  
  // Main body gradient
  const gradient = ctx.createLinearGradient(x - halfSize, y - height, x + halfSize, y);
  gradient.addColorStop(0, '#f97316');
  gradient.addColorStop(0.5, '#ea580c');
  gradient.addColorStop(1, '#c2410c');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x - halfSize, y - height, size, height);
  
  // Top cap
  ctx.fillStyle = 'rgba(255, 150, 100, 0.5)';
  ctx.fillRect(x - halfSize, y - height, size, size * 0.15);
  
  // Edge shading
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - halfSize, y - height, size, height);
  
  // Vertical detail lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const lineY = y - height + (height / 3) * i;
    ctx.beginPath();
    ctx.moveTo(x - halfSize, lineY);
    ctx.lineTo(x + halfSize, lineY);
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw a detailed player/runner with shading
 */
export function drawDetailedPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: CanvasTheme,
  isJumping: boolean,
  isSliding: boolean
): void {
  ctx.save();
  
  const halfWidth = width / 2;
  
  // Shadow
  if (!isJumping) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + height * 0.1, halfWidth * 0.8, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Body gradient
  const gradient = ctx.createLinearGradient(x - halfWidth, y - height, x + halfWidth, y);
  gradient.addColorStop(0, adjustBrightness(theme.accent, 30));
  gradient.addColorStop(0.5, theme.accent);
  gradient.addColorStop(1, adjustBrightness(theme.accent, -20));
  
  ctx.fillStyle = gradient;
  
  if (isSliding) {
    // Sliding: wider, flatter shape
    ctx.fillRect(x - halfWidth * 1.2, y - height, width * 1.2, height);
  } else {
    // Normal/jumping: rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x - halfWidth, y - height, width, height, width * 0.2);
    ctx.fill();
  }
  
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(x - halfWidth * 0.8, y - height * 0.95, width * 0.3, height * 0.4);
  
  // Edge outline
  ctx.strokeStyle = adjustBrightness(theme.accent, -40);
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (isSliding) {
    ctx.rect(x - halfWidth * 1.2, y - height, width * 1.2, height);
  } else {
    ctx.roundRect(x - halfWidth, y - height, width, height, width * 0.2);
  }
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw track with gradient and texture overlay
 */
export function drawDetailedTrack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  trackLeft: number,
  trackRight: number,
  theme: CanvasTheme,
  trackTexture: HTMLImageElement | null
): void {
  ctx.save();
  
  // Track shape
  ctx.beginPath();
  ctx.moveTo(width * 0.3, horizonY);
  ctx.lineTo(width * 0.7, horizonY);
  ctx.lineTo(trackRight, height);
  ctx.lineTo(trackLeft, height);
  ctx.closePath();
  
  // Base gradient
  const gradient = ctx.createLinearGradient(width / 2, horizonY, width / 2, height);
  gradient.addColorStop(0, adjustBrightness(theme.muted, -20));
  gradient.addColorStop(0.5, theme.muted);
  gradient.addColorStop(1, adjustBrightness(theme.muted, 10));
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Texture overlay if available
  if (trackTexture && trackTexture.complete) {
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.3;
    const pattern = ctx.createPattern(trackTexture, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(trackLeft, horizonY, trackRight - trackLeft, height - horizonY);
    }
    ctx.restore();
  }
  
  // Edge shading
  ctx.strokeStyle = adjustBrightness(theme.muted, -40);
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw enhanced lane dividers with perspective and glow
 */
export function drawDetailedLaneDividers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  trackLeft: number,
  trackWidth: number,
  theme: CanvasTheme,
  time: number
): void {
  ctx.save();
  
  const dashOffset = (time * 0.05) % 20; // Animated dashes
  
  for (let i = 1; i < 3; i++) {
    const laneX = trackLeft + (trackWidth / 3) * i;
    const topX = width * 0.3 + (width * 0.4 / 3) * i;
    
    // Glow effect
    ctx.strokeStyle = adjustBrightness(theme.primary, 40);
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.3;
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -dashOffset;
    ctx.beginPath();
    ctx.moveTo(topX, horizonY);
    ctx.lineTo(laneX, height);
    ctx.stroke();
    
    // Main line
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(topX, horizonY);
    ctx.lineTo(laneX, height);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
  ctx.restore();
}
