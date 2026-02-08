import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Player } from '../backend';

export function useGetPlayerStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Player>({
    queryKey: ['playerStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlayerStatus();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    refetchInterval: 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
