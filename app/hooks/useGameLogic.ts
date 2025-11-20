'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  CurrentPiece,
  TetrominoType,
  BOARD_WIDTH,
} from '../types/game.types';
import { TETROMINOS, getRandomTetromino, rotateShape } from '../utils/tetrominos';
import {
  createEmptyBoard,
  isValidPosition,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  calculateLevel,
  calculateSpeed,
  getStartPosition,
  tryRotate,
} from '../utils/gameHelpers';

const STORAGE_KEY = 'tetris-high-score';

// Get high score from localStorage
const getStoredHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

// Save high score to localStorage
const saveHighScore = (score: number): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, score.toString());
  }
};

// Create initial game state - use 'T' as default to avoid hydration mismatch
// The actual random piece will be set on client-side mount
const createInitialState = (): GameState => ({
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: 'T',
  score: 0,
  lines: 0,
  level: 1,
  gameOver: false,
  isPaused: false,
  isPlaying: false,
  highScore: 0,
});

// Create a new piece from type
const createPiece = (type: TetrominoType): CurrentPiece => {
  const tetromino = TETROMINOS[type];
  return {
    type,
    shape: tetromino.shape.map(row => [...row]),
    color: tetromino.color,
    position: getStartPosition(tetromino.shape),
    rotation: 0,
  };
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score and set initial random piece on mount (client-side only)
  useEffect(() => {
    const highScore = getStoredHighScore();
    const nextPiece = getRandomTetromino();
    setGameState(prev => ({ ...prev, highScore, nextPiece }));
  }, []);

  // Spawn a new piece
  const spawnPiece = useCallback(() => {
    setGameState(prev => {
      const newPiece = createPiece(prev.nextPiece);
      const nextPiece = getRandomTetromino();

      // Check if game is over - piece can't be placed at its position
      // First check with standard validation
      if (!isValidPosition(prev.board, newPiece.shape, newPiece.position)) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        if (prev.score > prev.highScore) {
          saveHighScore(prev.score);
        }
        return {
          ...prev,
          gameOver: true,
          isPlaying: false,
          currentPiece: null,
          highScore: newHighScore,
        };
      }

      // Additional check: Even if piece is above board (y=-1), check if any cells
      // that would be ON the board collide with existing pieces
      for (let y = 0; y < newPiece.shape.length; y++) {
        for (let x = 0; x < newPiece.shape[y].length; x++) {
          if (newPiece.shape[y][x]) {
            const boardY = newPiece.position.y + y;
            const boardX = newPiece.position.x + x;

            // If this cell is on the visible board and collides, game over
            if (boardY >= 0 && boardX >= 0 && boardX < BOARD_WIDTH) {
              if (prev.board[boardY] && prev.board[boardY][boardX] && prev.board[boardY][boardX].filled) {
                const newHighScore = Math.max(prev.score, prev.highScore);
                if (prev.score > prev.highScore) {
                  saveHighScore(prev.score);
                }
                return {
                  ...prev,
                  gameOver: true,
                  isPlaying: false,
                  currentPiece: null,
                  highScore: newHighScore,
                };
              }
            }
          }
        }
      }

      return {
        ...prev,
        currentPiece: newPiece,
        nextPiece,
      };
    });
  }, []);

  // Lock the current piece and check for lines
  const lockPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece) return prev;

      // Check if any part of the piece is above the visible board (game over)
      for (let y = 0; y < prev.currentPiece.shape.length; y++) {
        for (let x = 0; x < prev.currentPiece.shape[y].length; x++) {
          if (prev.currentPiece.shape[y][x]) {
            const boardY = prev.currentPiece.position.y + y;
            if (boardY < 0) {
              // Game over - piece locked above the visible board
              const newHighScore = Math.max(prev.score, prev.highScore);
              if (prev.score > prev.highScore) {
                saveHighScore(prev.score);
              }
              return {
                ...prev,
                gameOver: true,
                isPlaying: false,
                currentPiece: null,
                highScore: newHighScore,
              };
            }
          }
        }
      }

      // Merge piece to board
      let newBoard = mergePieceToBoard(prev.board, prev.currentPiece);

      // Clear completed lines
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      // Calculate new score and level
      const newLines = prev.lines + linesCleared;
      const newLevel = calculateLevel(newLines);
      const scoreGain = calculateScore(linesCleared, prev.level);
      const newScore = prev.score + scoreGain;

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: null,
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });

    // Spawn new piece after locking
    setTimeout(spawnPiece, 0);
  }, [spawnPiece]);

  // Move piece down
  const moveDown = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;

      const newPosition = {
        x: prev.currentPiece.position.x,
        y: prev.currentPiece.position.y + 1,
      };

      if (isValidPosition(prev.board, prev.currentPiece.shape, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition,
          },
        };
      }

      return prev;
    });
  }, []);

  // Check if piece should lock (called after moveDown)
  const checkLock = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) {
        // Clear lock timer if game is paused or not playing
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
        return prev;
      }

      const belowPosition = {
        x: prev.currentPiece.position.x,
        y: prev.currentPiece.position.y + 1,
      };

      if (!isValidPosition(prev.board, prev.currentPiece.shape, belowPosition)) {
        // Piece is touching ground - start lock delay if not already started
        if (!lockTimerRef.current) {
          // Lock delay = same as drop speed (based on level)
          const lockDelay = calculateSpeed(prev.level);
          lockTimerRef.current = setTimeout(() => {
            lockPiece();
            lockTimerRef.current = null;
          }, lockDelay);
        }
      } else {
        // Piece is not touching ground - cancel lock timer
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }

      return prev;
    });
  }, [lockPiece]);

  // Move piece left
  const moveLeft = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;

      const newPosition = {
        x: prev.currentPiece.position.x - 1,
        y: prev.currentPiece.position.y,
      };

      if (isValidPosition(prev.board, prev.currentPiece.shape, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition,
          },
        };
      }

      return prev;
    });
    // After moving, recheck lock status (may cancel or restart timer)
    setTimeout(() => checkLock(), 0);
  }, [checkLock]);

  // Move piece right
  const moveRight = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;

      const newPosition = {
        x: prev.currentPiece.position.x + 1,
        y: prev.currentPiece.position.y,
      };

      if (isValidPosition(prev.board, prev.currentPiece.shape, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition,
          },
        };
      }

      return prev;
    });
    // After moving, recheck lock status (may cancel or restart timer)
    setTimeout(() => checkLock(), 0);
  }, [checkLock]);

  // Rotate piece
  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;

      const rotatedShape = rotateShape(prev.currentPiece.shape);
      const newPosition = tryRotate(prev.board, prev.currentPiece, rotatedShape);

      if (newPosition) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            shape: rotatedShape,
            position: newPosition,
            rotation: (prev.currentPiece.rotation + 1) % 4,
          },
        };
      }

      return prev;
    });
    // After rotating, recheck lock status (may cancel or restart timer)
    setTimeout(() => checkLock(), 0);
  }, [checkLock]);

  // Hard drop
  const hardDrop = useCallback(() => {
    // Clear lock timer since we're locking immediately
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;

      let dropY = prev.currentPiece.position.y;
      while (
        isValidPosition(prev.board, prev.currentPiece.shape, {
          x: prev.currentPiece.position.x,
          y: dropY + 1,
        })
      ) {
        dropY++;
      }

      // Add score for hard drop (2 points per cell dropped)
      const dropDistance = dropY - prev.currentPiece.position.y;
      const dropScore = dropDistance * 2;

      return {
        ...prev,
        currentPiece: {
          ...prev.currentPiece,
          position: {
            ...prev.currentPiece.position,
            y: dropY,
          },
        },
        score: prev.score + dropScore,
      };
    });

    // Lock immediately after hard drop
    setTimeout(lockPiece, 0);
  }, [lockPiece]);

  // Soft drop (faster falling)
  const softDrop = useCallback(() => {
    moveDown();
    checkLock();
    // Add 1 point for soft drop
    setGameState(prev => ({
      ...prev,
      score: prev.score + 1,
    }));
  }, [moveDown, checkLock]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.gameOver) return prev;
      return {
        ...prev,
        isPaused: !prev.isPaused,
      };
    });
  }, []);

  // Start game
  const startGame = useCallback(() => {
    // Clear lock timer
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    setGameState(prev => ({
      ...createInitialState(),
      highScore: prev.highScore,
      isPlaying: true,
      nextPiece: getRandomTetromino(),
    }));
    setTimeout(spawnPiece, 100);
  }, [spawnPiece]);

  // Reset game
  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    // Clear lock timer
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    setGameState(prev => ({
      ...createInitialState(),
      highScore: prev.highScore,
    }));
  }, []);

  // Game loop - use setInterval instead of RAF so it works even when tab is not focused
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current as unknown as NodeJS.Timeout);
        gameLoopRef.current = null;
      }
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
      return;
    }

    const speed = calculateSpeed(gameState.level);
    lastTickRef.current = Date.now();

    // Use setInterval with smaller tick to ensure smooth gameplay
    // Check on each interval if enough time has passed for next move
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastTickRef.current >= speed) {
        moveDown();
        checkLock();
        lastTickRef.current = now;
      }
    }, Math.max(10, speed / 2)); // Check frequently but not too frequently

    gameLoopRef.current = intervalId as unknown as number;

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current as unknown as NodeJS.Timeout);
        gameLoopRef.current = null;
      }
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, gameState.level, moveDown, checkLock]);

  return {
    gameState,
    actions: {
      moveLeft,
      moveRight,
      moveDown: softDrop,
      rotate,
      hardDrop,
      togglePause,
      startGame,
      resetGame,
    },
  };
};
