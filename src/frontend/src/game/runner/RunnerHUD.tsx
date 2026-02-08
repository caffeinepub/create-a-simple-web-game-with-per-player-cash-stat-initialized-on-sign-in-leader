import { AlertCircle } from 'lucide-react';

interface RunnerHUDProps {
  cash: number;
  distance: number;
  coinsThisRun: number;
  awardError: Error | null;
}

export default function RunnerHUD({
  cash,
  distance,
  coinsThisRun,
  awardError,
}: RunnerHUDProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none">
      <div className="flex items-start justify-between gap-4">
        {/* Cash Display */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-primary/30 rounded-xl px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/generated/coin-icon.dim_256x256.png" 
              alt="Coin" 
              className="w-8 h-8"
            />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Cash</p>
              <p className="text-xl font-bold text-primary">${cash.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Run Stats */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl px-4 py-2 shadow-lg">
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Distance</p>
            <p className="text-xl font-bold">{Math.floor(distance)}m</p>
            <p className="text-xs text-accent font-medium mt-1">
              Coins: {coinsThisRun}
            </p>
          </div>
        </div>
      </div>

      {/* Error Indicator */}
      {awardError && (
        <div className="mt-2 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs text-destructive-foreground">
            Coin sync issue - gameplay continues
          </p>
        </div>
      )}
    </div>
  );
}
