'use client';

import React, { useMemo } from 'react';
import { Board, CurrentPiece, BOARD_WIDTH, BOARD_HEIGHT } from '../types/game.types';
import { getGhostPosition } from '../utils/gameHelpers';

interface GameBoardProps {
  board: Board;
  currentPiece: CurrentPiece | null;
  isPaused: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = React.memo(
  ({ board, currentPiece, isPaused }) => {
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

    return (
      <div className="relative">
        {/* Game board container */}
        <div
          className="grid gap-[1px] bg-gray-800 p-1 rounded-lg border-2 border-gray-700 shadow-2xl"
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
                  ${cell.filled ? 'shadow-inner' : 'bg-gray-900'}
                  ${cell.isGhost ? 'opacity-30' : ''}
                  ${cell.isCurrent ? 'animate-pulse-subtle' : ''}
                `}
                style={{
                  backgroundColor: cell.filled ? cell.color : undefined,
                  boxShadow: cell.filled && !cell.isGhost
                    ? `inset 2px 2px 4px rgba(255,255,255,0.3),
                       inset -2px -2px 4px rgba(0,0,0,0.3),
                       0 0 10px ${cell.color}40`
                    : undefined,
                  border: cell.filled
                    ? `1px solid ${cell.color}80`
                    : '1px solid rgba(55, 65, 81, 0.5)',
                }}
              />
            ))
          )}
        </div>

        {/* Pause overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">PAUSED</p>
              <p className="text-sm text-gray-300">Press P to resume</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GameBoard.displayName = 'GameBoard';
