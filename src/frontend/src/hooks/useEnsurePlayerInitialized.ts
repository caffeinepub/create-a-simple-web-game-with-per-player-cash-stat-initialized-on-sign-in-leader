import { useEffect, useState } from 'react';
import { useActor } from './useActor';
import { useInitializeCash } from './useCashActions';
import { useGetPlayerStatus } from './usePlayerStatus';

type InitStatus = 'idle' | 'initializing' | 'ready' | 'error';

export function useEnsurePlayerInitialized() {
  const { actor, isFetching: actorFetching } = useActor();
  const { mutate: initializeCash, isPending: isInitializing, error: initError } = useInitializeCash();
  const { data: playerStatus, isLoading: statusLoading, error: statusError, refetch: refetchStatus, isFetched } = useGetPlayerStatus();
  
  const [initStatus, setInitStatus] = useState<InitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Orchestrate initialization flow
  useEffect(() => {
    // Wait for actor to be ready
    if (actorFetching || !actor) {
      setInitStatus('idle');
      return;
    }

    // If we have player status, we're ready
    if (playerStatus) {
      setInitStatus('ready');
      setErrorMessage('');
      return;
    }

    // If status query hasn't been attempted yet, wait
    if (!isFetched) {
      return;
    }

    // If we got an error and it's about not being initialized, try to initialize
    if (statusError && !isInitializing) {
      const errorMsg = statusError.message || '';
      
      if (errorMsg.includes('not initialized') || errorMsg.includes('Initialization required')) {
        setInitStatus('initializing');
        initializeCash(undefined, {
          onSuccess: () => {
            // After successful init, refetch status
            refetchStatus();
          },
          onError: (error: any) => {
            const msg = error.message || 'Unknown error';
            // If already initialized, just refetch status
            if (msg.includes('already initialized')) {
              refetchStatus();
            } else {
              setInitStatus('error');
              setErrorMessage(msg);
            }
          }
        });
      } else {
        // Other error
        setInitStatus('error');
        setErrorMessage(errorMsg);
      }
    }
  }, [actor, actorFetching, playerStatus, statusError, isInitializing, isFetched, initializeCash, refetchStatus]);

  const retry = () => {
    setInitStatus('idle');
    setErrorMessage('');
    refetchStatus();
  };

  const runInitialize = () => {
    setInitStatus('initializing');
    setErrorMessage('');
    initializeCash(undefined, {
      onSuccess: () => {
        refetchStatus();
      },
      onError: (error: any) => {
        const msg = error.message || 'Unknown error';
        if (msg.includes('already initialized')) {
          refetchStatus();
        } else {
          setInitStatus('error');
          setErrorMessage(msg);
        }
      }
    });
  };

  return {
    initStatus: actorFetching || statusLoading ? 'initializing' : initStatus,
    isReady: initStatus === 'ready' && !!playerStatus,
    errorMessage,
    retry,
    runInitialize,
    playerStatus
  };
}
