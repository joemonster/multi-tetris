'use client';

import React, { useMemo } from 'react';
import { Board, CurrentPiece, BOARD_WIDTH, BOARD_HEIGHT } from '../types/game.types';
import { getGhostPosition } from '../utils/gameHelpers';
import { useTheme } from '../contexts/ThemeContext';

interface GameBoardProps {
  board: Board;
  currentPiece: CurrentPiece | null;
  isPaused: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = React.memo(
  ({ board, currentPiece, isPaused }) => {
    const { themeId } = useTheme();

    // Calculate ghost piece position
    const ghostPosition = useMemo(() => {
      if (!currentPiece) return null;
      return getGhostPosition(board, currentPiece);
    }, [board, currentPiece]);

    // Render the board with current piece and ghost
    const renderBoard = useMemo(() => {
      // Create a copy of the board for rendering
      const displayBoard = board.map(row =>
        row.map(cell => ({ ...cell, isGhost: false, isCurrent: false }))
      );

      // Add ghost piece
      if (currentPiece && ghostPosition) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
          for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
              const boardY = ghostPosition.y + y;
              const boardX = ghostPosition.x + x;
              if (
                boardY >= 0 &&
                boardY < BOARD_HEIGHT &&
                boardX >= 0 &&
                boardX < BOARD_WIDTH
              ) {
                displayBoard[boardY][boardX] = {
                  filled: true,
                  color: currentPiece.color,
                  isGhost: true,
                  isCurrent: false,
                };
              }
            }
          }
        }
      }

      // Add current piece (on top of ghost)
      if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
          for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
              const boardY = currentPiece.position.y + y;
              const boardX = currentPiece.position.x + x;
              if (
                boardY >= 0 &&
                boardY < BOARD_HEIGHT &&
                boardX >= 0 &&
                boardX < BOARD_WIDTH
              ) {
                displayBoard[boardY][boardX] = {
                  filled: true,
                  color: currentPiece.color,
                  isGhost: false,
                  isCurrent: true,
                };
              }
            }
          }
        }
      }

      return displayBoard;
    }, [board, currentPiece, ghostPosition]);

    // Get theme-specific block styles
    const getBlockStyle = (cell: { filled: boolean; color: string; isGhost: boolean; isCurrent: boolean }) => {
      if (!cell.filled) {
        return {
          backgroundColor: undefined,
          boxShadow: undefined,
          border: themeId === 'brutalist'
            ? '1px solid rgba(40, 40, 40, 0.8)'
            : themeId === 'organic-flow'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(55, 65, 81, 0.5)',
          borderRadius: themeId === 'organic-flow' ? '4px' : themeId === 'brutalist' ? '0' : '1px',
        };
      }

      const baseStyles = {
        backgroundColor: cell.color,
        borderRadius: themeId === 'organic-flow' ? '6px' : themeId === 'brutalist' ? '0' : '1px',
      };

      if (cell.isGhost) {
        return {
          ...baseStyles,
          opacity: 0.3,
          boxShadow: 'none',
          border: `1px solid ${cell.color}40`,
        };
      }

      // Theme-specific active block styles
      switch (themeId) {
        case 'neon-tokyo':
          return {
            ...baseStyles,
            boxShadow: `
              0 0 10px ${cell.color},
              0 0 20px ${cell.color}80,
              inset 2px 2px 4px rgba(255,255,255,0.3),
              inset -2px -2px 4px rgba(0,0,0,0.3)
            `,
            border: `1px solid ${cell.color}`,
          };
        case 'brutalist':
          return {
            ...baseStyles,
            boxShadow: `3px 3px 0px rgba(0,0,0,0.8)`,
            border: '2px solid #000',
          };
        case 'organic-flow':
          return {
            ...baseStyles,
            boxShadow: `
              0 4px 16px rgba(31, 38, 135, 0.37),
              inset 2px 2px 4px rgba(255,255,255,0.4)
            `,
            border: `1px solid rgba(255,255,255,0.3)`,
          };
        default:
          return {
            ...baseStyles,
            boxShadow: `
              inset 2px 2px 4px rgba(255,255,255,0.3),
              inset -2px -2px 4px rgba(0,0,0,0.3),
              0 0 10px ${cell.color}40
            `,
            border: `1px solid ${cell.color}80`,
          };
      }
    };

    // Get theme-specific board container styles
    const getBoardContainerClass = () => {
      const baseClass = 'grid gap-[1px] p-1 shadow-2xl';
      switch (themeId) {
        case 'neon-tokyo':
          return `${baseClass} bg-black/80 rounded-lg border-2 border-cyan-500/50`;
        case 'brutalist':
          return `${baseClass} bg-black border-4 border-black`;
        case 'organic-flow':
          return `${baseClass} bg-white/10 backdrop-blur-sm rounded-xl border border-white/20`;
        default:
          return `${baseClass} bg-gray-800 rounded-lg border-2 border-gray-700`;
      }
    };

    // Get theme-specific pause overlay styles
    const getPauseOverlayClass = () => {
      switch (themeId) {
        case 'neon-tokyo':
          return 'bg-black/80 rounded-lg';
        case 'brutalist':
          return 'bg-black/90';
        case 'organic-flow':
          return 'bg-white/30 backdrop-blur-md rounded-xl';
        default:
          return 'bg-black/70 rounded-lg';
      }
    };

    const getPauseTextClass = () => {
      switch (themeId) {
        case 'neon-tokyo':
          return 'neon-tokyo-title text-cyan-400';
        case 'brutalist':
          return 'brutalist-title text-white';
        case 'organic-flow':
          return 'organic-title text-white';
        default:
          return 'text-white';
      }
    };

    return (
      <div className="relative">
        {/* Game board container */}
        <div
          className={getBoardContainerClass()}
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
          }}
        >
          {renderBoard.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`
                  aspect-square w-5 sm:w-6 md:w-7
                  transition-all duration-100
                  ${cell.filled ? 'shadow-inner' : themeId === 'organic-flow' ? 'bg-white/5' : themeId === 'brutalist' ? 'bg-neutral-900' : 'bg-gray-900'}
                  ${cell.isCurrent ? 'animate-pulse-subtle' : ''}
                `}
                style={getBlockStyle(cell)}
              />
            ))
          )}
        </div>

        {/* Pause overlay */}
        {isPaused && (
          <div className={`absolute inset-0 flex items-center justify-center ${getPauseOverlayClass()}`}>
            <div className="text-center">
              <p className={`text-2xl font-bold mb-2 ${getPauseTextClass()}`}>
                {themeId === 'brutalist' ? 'PAUSED' : 'PAUSED'}
              </p>
              <p className={`text-sm ${themeId === 'organic-flow' ? 'text-white/80' : 'text-gray-300'}`}>
                Press P to resume
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GameBoard.displayName = 'GameBoard';
