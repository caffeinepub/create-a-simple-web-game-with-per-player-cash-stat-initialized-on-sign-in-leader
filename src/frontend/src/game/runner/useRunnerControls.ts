import { useEffect, useCallback } from 'react';
import { type RunState } from './types';

interface ControlActions {
  changeLane: (direction: 'left' | 'right') => void;
  jump: () => void;
  slide: () => void;
  pause: () => void;
}

export function useRunnerControls(
  runState: RunState,
  actions: ControlActions,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Pause/Resume
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      actions.pause();
      return;
    }

    // Only allow gameplay controls when running
    if (runState !== 'running') return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        actions.changeLane('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        actions.changeLane('right');
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        e.preventDefault();
        actions.jump();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        actions.slide();
        break;
    }
  }, [enabled, runState, actions]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    // Expose actions for touch controls
    moveLeft: () => actions.changeLane('left'),
    moveRight: () => actions.changeLane('right'),
    jump: actions.jump,
    slide: actions.slide,
  };
}
