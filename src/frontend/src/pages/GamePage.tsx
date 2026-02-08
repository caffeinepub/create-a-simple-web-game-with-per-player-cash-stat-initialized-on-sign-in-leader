import { useEffect } from 'react';
import GameLayout from '../components/GameLayout';
import LeaderboardPanel from '../components/LeaderboardPanel';
import AdminLeaderboardControls from '../components/AdminLeaderboardControls';
import { useEnsurePlayerInitialized } from '../hooks/useEnsurePlayerInitialized';
import { Loader2, AlertCircle, RefreshCw, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRunnerGame } from '../game/runner/useRunnerGame';
import { useRunnerControls } from '../game/runner/useRunnerControls';
import { useCoinCashAwarder } from '../game/runner/useCoinCashAwarder';
import RunnerCanvas3D from '../game/runner/RunnerCanvas3D';
import RunnerHUD from '../game/runner/RunnerHUD';
import RunnerOverlays from '../game/runner/RunnerOverlays';
import TouchControls from '../game/runner/TouchControls';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Trophy } from 'lucide-react';

export default function GamePage() {
  const { initStatus, isReady, errorMessage, retry, runInitialize, playerStatus } = useEnsurePlayerInitialized();
  
  const {
    runState,
    playerState,
    entities,
    stats,
    currentSpeed,
    actions,
  } = useRunnerGame();

  const controls = useRunnerControls(
    runState,
    {
      changeLane: actions.changeLane,
      jump: actions.jump,
      slide: actions.slide,
      pause: actions.pause,
    },
    isReady && (runState === 'running' || runState === 'paused')
  );

  const { isAwarding, awardError } = useCoinCashAwarder(
    stats.coinsCollected,
    isReady && runState === 'running'
  );

  // Auto-start on ready
  useEffect(() => {
    if (isReady && runState === 'ready') {
      // Auto-start after a brief moment
      const timer = setTimeout(() => {
        actions.start();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReady, runState, actions]);

  // Loading state
  if (initStatus === 'initializing') {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Setting up your game...</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  // Error state with recovery
  if (initStatus === 'error' || (!isReady && errorMessage)) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md bg-card border border-border rounded-lg p-8 shadow-lg">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Game</h2>
            <p className="text-muted-foreground mb-6">
              {errorMessage || 'Something went wrong while loading your game data.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={retry} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button onClick={runInitialize} variant="outline" className="gap-2">
                <Gift className="w-4 h-4" />
                Initialize Game
              </Button>
            </div>
          </div>
        </div>
      </GameLayout>
    );
  }

  // Wait for ready state
  if (!isReady || !playerStatus) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your game...</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  const cash = Number(playerStatus.cash);

  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="relative w-full aspect-[16/10] lg:aspect-[16/9] bg-muted rounded-lg overflow-hidden shadow-2xl border-2 border-border">
              {/* 3D Canvas */}
              <RunnerCanvas3D
                playerState={playerState}
                entities={entities}
                currentSpeed={currentSpeed}
              />

              {/* HUD */}
              <RunnerHUD
                cash={cash}
                distance={stats.distance}
                coinsThisRun={stats.coinsThisRun}
                awardError={awardError}
              />

              {/* Overlays */}
              <RunnerOverlays
                runState={runState}
                distance={stats.distance}
                coinsThisRun={stats.coinsThisRun}
                onStart={actions.start}
                onPause={actions.pause}
                onRestart={actions.restart}
              />
            </div>

            {/* Touch Controls (Mobile) */}
            <div className="lg:hidden">
              <TouchControls
                onMoveLeft={controls.moveLeft}
                onMoveRight={controls.moveRight}
                onJump={controls.jump}
                onSlide={controls.slide}
                disabled={runState !== 'running'}
              />
            </div>

            {/* Desktop Instructions */}
            <div className="hidden lg:block mt-4 text-center text-sm text-muted-foreground">
              <p>
                <kbd className="px-2 py-1 bg-muted rounded">←</kbd>
                <kbd className="px-2 py-1 bg-muted rounded ml-1">→</kbd> Move • 
                <kbd className="px-2 py-1 bg-muted rounded ml-2">↑</kbd> Jump • 
                <kbd className="px-2 py-1 bg-muted rounded ml-1">↓</kbd> Slide • 
                <kbd className="px-2 py-1 bg-muted rounded ml-2">ESC</kbd> Pause
              </p>
            </div>
          </div>

          {/* Leaderboard Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <AdminLeaderboardControls />
            <LeaderboardPanel />
          </div>

          {/* Leaderboard Sheet - Mobile */}
          <div className="lg:hidden fixed bottom-24 right-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full shadow-lg h-14 w-14"
                >
                  <Trophy className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Leaderboard & Controls</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4 overflow-y-auto h-[calc(80vh-100px)]">
                  <AdminLeaderboardControls />
                  <LeaderboardPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
