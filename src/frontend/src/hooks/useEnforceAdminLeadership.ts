import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useEnforceAdminLeadership() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      
      const adminPrincipal = identity.getPrincipal();
      await actor.enforceAdminCashLeadership(adminPrincipal);
    },
    onSuccess: () => {
      // Invalidate both player status and leaderboard to show updated data
      queryClient.invalidateQueries({ queryKey: ['playerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['cashLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
    },
    onError: (error: any) => {
      console.error('Failed to enforce admin leadership:', error);
      // Return a clear error message
      const message = error?.message || 'Failed to enforce admin leadership';
      if (message.includes('Unauthorized')) {
        throw new Error('Only admins can perform this action');
      }
      throw new Error(message);
    },
  });
}
