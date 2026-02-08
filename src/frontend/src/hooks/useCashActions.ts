import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useInitializeCash() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.initializeCash();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['cashLeaderboard'] });
    },
  });
}

export function useAddCash() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.addCash();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['cashLeaderboard'] });
    },
  });
}

export function useClaimStarterReward() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.claimStarterReward();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['cashLeaderboard'] });
    },
  });
}

export function useUpgradeSpeed() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.upgradeSpeed();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
    },
  });
}
