'use client';

import { useEffect, useCallback } from 'react';

interface GameActions {
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  startGame: () => void;
  resetGame: () => void;
}

interface UseKeyboardControlsProps {
  actions: GameActions;
  isPlaying: boolean;
  gameOver: boolean;
}

export const useKeyboardControls = ({
  actions,
  isPlaying,
  gameOver,
}: UseKeyboardControlsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Prevent default browser actions for game keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyP'].includes(
          event.code
        )
      ) {
        event.preventDefault();
      }

      // Start game on Enter if not playing
      if (event.code === 'Enter' && (!isPlaying || gameOver)) {
        actions.startGame();
        return;
      }

      // Game controls (only when playing and not game over)
      if (!isPlaying || gameOver) return;

      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          actions.moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          actions.moveRight();
          break;
        case 'ArrowDown':
        case 'KeyS':
          actions.moveDown();
          break;
        case 'ArrowUp':
        case 'KeyW':
          actions.rotate();
          break;
        case 'Space':
          actions.hardDrop();
          break;
        case 'KeyP':
        case 'Escape':
          actions.togglePause();
          break;
        case 'KeyR':
          actions.resetGame();
          break;
      }
    },
    [actions, isPlaying, gameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
