import { useEffect, useRef, useCallback } from 'react';
import { useAddCash } from '../../hooks/useCashActions';

export function useCoinCashAwarder(coinsCollected: number, enabled: boolean) {
  const { mutate: addCash, isPending, error } = useAddCash();
  const lastAwardedRef = useRef(0);
  const pendingCoinsRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Batch coin awards to avoid spamming backend
  const awardPendingCoins = useCallback(() => {
    if (pendingCoinsRef.current > 0 && !isPending) {
      const toAward = pendingCoinsRef.current;
      pendingCoinsRef.current = 0;
      
      // Award coins one at a time (backend adds 1 per call)
      for (let i = 0; i < toAward; i++) {
        addCash();
      }
    }
  }, [addCash, isPending]);

  useEffect(() => {
    if (!enabled) return;

    const newCoins = coinsCollected - lastAwardedRef.current;
    if (newCoins > 0) {
      lastAwardedRef.current = coinsCollected;
      pendingCoinsRef.current += newCoins;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Batch awards with a small delay
      timeoutRef.current = setTimeout(() => {
        awardPendingCoins();
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [coinsCollected, enabled, awardPendingCoins]);

  return {
    isAwarding: isPending,
    awardError: error,
  };
}
