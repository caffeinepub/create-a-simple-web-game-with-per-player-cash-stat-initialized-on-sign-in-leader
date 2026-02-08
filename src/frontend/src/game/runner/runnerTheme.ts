// Centralized theme color extraction and normalization for canvas rendering

export interface CanvasTheme {
  background: string;
  primary: string;
  accent: string;
  muted: string;
  foreground: string;
}

/**
 * Parse OKLCH color string to RGB hex
 * Simplified conversion for canvas rendering
 */
function oklchToHex(oklchStr: string): string {
  // Extract L, C, H values from oklch(L C H) or oklch(L C H / A)
  const match = oklchStr.match(/oklch\(([\d.]+)%?\s+([\d.]+)%?\s+([\d.]+)/);
  if (!match) return '#000000';

  const l = parseFloat(match[1]) / 100; // 0-1
  const c = parseFloat(match[2]) / 100; // 0-1 (normalized)
  const h = parseFloat(match[3]); // 0-360

  // Simplified OKLCH to RGB conversion (approximate)
  // For production, use a proper color library, but this works for our needs
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // Convert Lab to RGB (simplified)
  let r = l + 0.3963 * a + 0.2158 * b;
  let g = l - 0.1055 * a - 0.0638 * b;
  let bl = l - 0.0894 * a - 1.2914 * b;

  // Clamp and convert to 0-255
  r = Math.max(0, Math.min(1, r)) * 255;
  g = Math.max(0, Math.min(1, g)) * 255;
  bl = Math.max(0, Math.min(1, bl)) * 255;

  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

/**
 * Read theme colors from CSS variables and convert to canvas-ready hex values
 */
export function getCanvasTheme(): CanvasTheme {
  const computedStyle = getComputedStyle(document.documentElement);
  
  const bgColor = computedStyle.getPropertyValue('--background').trim();
  const primaryColor = computedStyle.getPropertyValue('--primary').trim();
  const accentColor = computedStyle.getPropertyValue('--accent').trim();
  const mutedColor = computedStyle.getPropertyValue('--muted').trim();
  const foregroundColor = computedStyle.getPropertyValue('--foreground').trim();

  return {
    background: bgColor.includes('oklch') ? oklchToHex(bgColor) : (bgColor || '#0a0a0a'),
    primary: primaryColor.includes('oklch') ? oklchToHex(primaryColor) : (primaryColor || '#f59e0b'),
    accent: accentColor.includes('oklch') ? oklchToHex(accentColor) : (accentColor || '#14b8a6'),
    muted: mutedColor.includes('oklch') ? oklchToHex(mutedColor) : (mutedColor || '#27272a'),
    foreground: foregroundColor.includes('oklch') ? oklchToHex(foregroundColor) : (foregroundColor || '#fafafa'),
  };
}

/**
 * Lighten or darken a hex color
 */
export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
