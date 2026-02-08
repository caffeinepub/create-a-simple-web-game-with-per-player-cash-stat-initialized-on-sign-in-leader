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
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addCash(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['cashLeaderboard'] });
    },
    onError: (error) => {
      console.error('Failed to add cash:', error);
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
    onError: (error: any) => {
      console.error('Failed to claim reward:', error);
      throw error;
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
      queryClient.invalidateQueries({ queryKey: ['cashLeaderboard'] });
    },
    onError: (error: any) => {
      console.error('Failed to upgrade speed:', error);
      throw error;
    },
  });
}
