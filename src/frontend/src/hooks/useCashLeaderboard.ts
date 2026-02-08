import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LeaderboardEntry } from '../backend';

export function useGetCashLeaderboard(limit: number = 10) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<LeaderboardEntry[]>({
    queryKey: ['cashLeaderboard', limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCashLeaderboard(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    refetchInterval: 5000, // Poll every 5 seconds for leaderboard updates
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
