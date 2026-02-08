import { useState, useEffect } from 'react';
import GameLayout from '../components/GameLayout';
import LeaderboardPanel from '../components/LeaderboardPanel';
import AdminLeaderboardControls from '../components/AdminLeaderboardControls';
import { useAddCash, useClaimStarterReward, useUpgradeSpeed } from '../hooks/useCashActions';
import { useEnsurePlayerInitialized } from '../hooks/useEnsurePlayerInitialized';
import { Loader2, Gift, Coins as CoinsIcon, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const { initStatus, isReady, errorMessage, retry, runInitialize, playerStatus } = useEnsurePlayerInitialized();
  const { mutate: addCash, isPending: isAddingCash } = useAddCash();
  const { mutate: claimReward, isPending: isClaimingReward, error: claimError } = useClaimStarterReward();
  const { mutate: upgradeSpeed, isPending: isUpgradingSpeed, error: upgradeError } = useUpgradeSpeed();
  
  const [timeUntilReward, setTimeUntilReward] = useState<number>(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (!playerStatus || playerStatus.hasClaimedReward) {
      setCanClaim(false);
      setTimeUntilReward(0);
      return;
    }

    const updateTimer = () => {
      const joinedAtMs = Number(playerStatus.joinedAt) / 1_000_000;
      const now = Date.now();
      const elapsed = now - joinedAtMs;
      const remaining = Math.max(0, 5000 - elapsed);
      
      setTimeUntilReward(remaining);
      setCanClaim(remaining === 0 && !playerStatus.hasClaimedReward);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [playerStatus]);

  const handleEarnClick = () => {
    const clickSpeed = playerStatus ? Number(playerStatus.clickSpeed) : 1;
    addCash(BigInt(clickSpeed));
  };

  const handleClaimReward = () => {
    claimReward();
  };

  const handleUpgradeSpeed = () => {
    upgradeSpeed();
  };

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
  const clickSpeed = Number(playerStatus.clickSpeed);
  const canAffordUpgrade = cash >= 10;

  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* Cash Display */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-4 bg-card border-2 border-primary/20 rounded-2xl px-8 py-6 shadow-lg">
                <img 
                  src="/assets/generated/coin-icon.dim_256x256.png" 
                  alt="Coin" 
                  className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg"
                />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground font-medium">Your Cash</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    ${cash.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Earn Button */}
              <button
                onClick={handleEarnClick}
                disabled={isAddingCash}
                className="group relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl p-8 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="relative flex flex-col items-center gap-3">
                  {isAddingCash ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : (
                    <CoinsIcon className="w-12 h-12 group-hover:rotate-12 transition-transform" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Earn Cash</h3>
                    <p className="text-sm opacity-90">Click to earn +${clickSpeed}</p>
                  </div>
                </div>
              </button>

              {/* Claim Reward Button */}
              <button
                onClick={handleClaimReward}
                disabled={!canClaim || isClaimingReward || playerStatus.hasClaimedReward}
                className="group relative overflow-hidden bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground rounded-xl p-8 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="relative flex flex-col items-center gap-3">
                  {isClaimingReward ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : (
                    <Gift className="w-12 h-12 group-hover:scale-110 transition-transform" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {playerStatus.hasClaimedReward ? 'Claimed!' : 'Starter Bonus'}
                    </h3>
                    {playerStatus.hasClaimedReward ? (
                      <p className="text-sm opacity-90">Already claimed</p>
                    ) : canClaim ? (
                      <p className="text-sm opacity-90">Claim your $100 now!</p>
                    ) : (
                      <p className="text-sm opacity-90">
                        Available in {Math.ceil(timeUntilReward / 1000)}s
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Speed Upgrade Section */}
            <div className="mb-8">
              <button
                onClick={handleUpgradeSpeed}
                disabled={!canAffordUpgrade || isUpgradingSpeed}
                className="w-full group relative overflow-hidden bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground rounded-xl p-6 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isUpgradingSpeed ? (
                      <Loader2 className="w-10 h-10 animate-spin" />
                    ) : (
                      <Zap className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1">Buy +1 Speed (10 Cash)</h3>
                      <p className="text-sm opacity-90">
                        Current Speed: {clickSpeed}x | Earn ${clickSpeed} per click
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$10</p>
                    {!canAffordUpgrade && (
                      <p className="text-xs opacity-75">Need ${10 - cash} more</p>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Error Messages */}
            {claimError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center mb-4">
                <p className="text-sm text-destructive">{claimError.message}</p>
              </div>
            )}
            {upgradeError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center mb-4">
                <p className="text-sm text-destructive">{upgradeError.message}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-2xl font-bold">${cash.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Click Speed</p>
                <p className="text-2xl font-bold">{clickSpeed}x</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Bonus Status</p>
                <p className="text-2xl font-bold">
                  {playerStatus.hasClaimedReward ? '✓' : timeUntilReward > 0 ? '⏳' : '🎁'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Clicks</p>
                <p className="text-2xl font-bold">{cash}</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AdminLeaderboardControls />
            <LeaderboardPanel />
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
