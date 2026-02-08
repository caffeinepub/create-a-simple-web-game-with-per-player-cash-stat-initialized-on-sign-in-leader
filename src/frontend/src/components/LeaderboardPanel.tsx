import { useGetCashLeaderboard } from '../hooks/useCashLeaderboard';
import { useIsCallerAdmin } from '../hooks/useUserRole';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Trophy, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LeaderboardPanel() {
  const { data: leaderboard, isLoading } = useGetCashLeaderboard(10);
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { identity } = useInternetIdentity();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Cash Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Cash Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No players yet. Be the first!
          </p>
        </CardContent>
      </Card>
    );
  }

  const shortenPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Cash Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const playerPrincipal = entry.player.toString();
              const isCurrentUser = playerPrincipal === currentUserPrincipal;
              const rank = index + 1;
              
              return (
                <div
                  key={playerPrincipal}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isCurrentUser
                      ? 'bg-primary/10 border-2 border-primary/30'
                      : 'bg-card border border-border hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 text-center">
                      {rank === 1 && (
                        <Crown className="w-6 h-6 text-yellow-500 inline-block" />
                      )}
                      {rank === 2 && (
                        <span className="text-lg font-bold text-gray-400">2</span>
                      )}
                      {rank === 3 && (
                        <span className="text-lg font-bold text-amber-600">3</span>
                      )}
                      {rank > 3 && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {rank}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono truncate">
                          {shortenPrincipal(playerPrincipal)}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                        {!isAdminLoading && isAdmin && isCurrentUser && (
                          <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <p className="text-lg font-bold text-primary">
                      ${Number(entry.cash).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
