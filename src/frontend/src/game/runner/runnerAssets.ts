// Asset loader for runner game sprites and textures

export interface RunnerAssets {
  coinSprite: HTMLImageElement | null;
  obstacleLow: HTMLImageElement | null;
  obstacleHigh: HTMLImageElement | null;
  trackTile: HTMLImageElement | null;
  playerSprite: HTMLImageElement | null;
  loaded: boolean;
  failed: string[];
}

const assets: RunnerAssets = {
  coinSprite: null,
  obstacleLow: null,
  obstacleHigh: null,
  trackTile: null,
  playerSprite: null,
  loaded: false,
  failed: [],
};

/**
 * Load an image and return a promise
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/**
 * Preload all runner assets
 */
export async function preloadRunnerAssets(): Promise<RunnerAssets> {
  const assetPaths = {
    coinSprite: '/assets/generated/runner-coin-sprite.dim_256x256.png',
    obstacleLow: '/assets/generated/runner-obstacle-low.dim_256x256.png',
    obstacleHigh: '/assets/generated/runner-obstacle-high.dim_256x256.png',
    trackTile: '/assets/generated/runner-track-tile.dim_512x512.png',
    playerSprite: '/assets/generated/runner-player-sprite.dim_256x256.png',
  };

  const results = await Promise.allSettled([
    loadImage(assetPaths.coinSprite),
    loadImage(assetPaths.obstacleLow),
    loadImage(assetPaths.obstacleHigh),
    loadImage(assetPaths.trackTile),
    loadImage(assetPaths.playerSprite),
  ]);

  assets.failed = [];

  if (results[0].status === 'fulfilled') {
    assets.coinSprite = results[0].value;
  } else {
    assets.failed.push('coinSprite');
  }

  if (results[1].status === 'fulfilled') {
    assets.obstacleLow = results[1].value;
  } else {
    assets.failed.push('obstacleLow');
  }

  if (results[2].status === 'fulfilled') {
    assets.obstacleHigh = results[2].value;
  } else {
    assets.failed.push('obstacleHigh');
  }

  if (results[3].status === 'fulfilled') {
    assets.trackTile = results[3].value;
  } else {
    assets.failed.push('trackTile');
  }

  if (results[4].status === 'fulfilled') {
    assets.playerSprite = results[4].value;
  } else {
    assets.failed.push('playerSprite');
  }

  assets.loaded = true;
  return assets;
}

/**
 * Get the current asset state
 */
export function getRunnerAssets(): RunnerAssets {
  return assets;
}
