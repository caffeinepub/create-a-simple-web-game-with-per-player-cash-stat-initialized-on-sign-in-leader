import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { type RunState } from './types';

interface RunnerOverlaysProps {
  runState: RunState;
  distance: number;
  coinsThisRun: number;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export default function RunnerOverlays({
  runState,
  distance,
  coinsThisRun,
  onStart,
  onPause,
  onRestart,
}: RunnerOverlaysProps) {
  // Start overlay
  if (runState === 'ready') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-6 max-w-md px-4">
          <h2 className="text-4xl font-bold">Ready to Run?</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>🎮 Desktop: Arrow keys or WASD to move</p>
            <p>⬆️ Jump (Space/W) • ⬇️ Slide (S)</p>
            <p>📱 Mobile: Use on-screen controls</p>
            <p>⏸️ Press ESC or P to pause</p>
          </div>
          <Button size="lg" onClick={onStart} className="gap-2">
            <Play className="w-5 h-5" />
            Start Running
          </Button>
        </div>
      </div>
    );
  }

  // Pause overlay
  if (runState === 'paused') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold">Paused</h2>
          <div className="flex gap-4">
            <Button size="lg" onClick={onPause} className="gap-2">
              <Play className="w-5 h-5" />
              Resume
            </Button>
            <Button size="lg" variant="outline" onClick={onRestart} className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Restart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over overlay
  if (runState === 'gameOver') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm">
        <div className="text-center space-y-6 max-w-md px-4">
          <h2 className="text-5xl font-bold text-destructive">Game Over!</h2>
          <div className="bg-card border-2 border-border rounded-xl p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-3xl font-bold">{Math.floor(distance)}m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coins Collected</p>
              <p className="text-3xl font-bold text-primary">{coinsThisRun}</p>
            </div>
          </div>
          <Button size="lg" onClick={onRestart} className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  // Pause button (visible during running)
  if (runState === 'running') {
    return (
      <div className="absolute top-4 right-4 z-30">
        <Button
          size="icon"
          variant="secondary"
          onClick={onPause}
          className="rounded-full shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border"
        >
          <Pause className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return null;
}
