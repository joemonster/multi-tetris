'use client';

import React from 'react';
import { TetrominoType } from '../types/game.types';
import { TETROMINOS } from '../utils/tetrominos';
import { useTheme } from '../contexts/ThemeContext';

interface NextPieceProps {
  pieceType: TetrominoType;
}

export const NextPiece: React.FC<NextPieceProps> = React.memo(({ pieceType }) => {
  const { themeId } = useTheme();
  const tetromino = TETROMINOS[pieceType];
  const shape = tetromino.shape;
  const color = tetromino.color;

  // Find the bounding box of the actual piece (remove empty rows/cols)
  let minX = shape[0].length, maxX = 0, minY = shape.length, maxY = 0;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const trimmedShape = shape
    .slice(minY, maxY + 1)
    .map(row => row.slice(minX, maxX + 1));

  // Get theme-specific container styles
  const getContainerClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'bg-black/60 rounded-lg p-4 border border-cyan-500/30';
      case 'brutalist':
        return 'bg-neutral-800 p-4 border-4 border-black brutalist-panel';
      case 'organic-flow':
        return 'organic-panel p-4';
      default:
        return 'bg-gray-800 rounded-lg p-4 border border-gray-700';
    }
  };

  // Get theme-specific title styles
  const getTitleClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider';
      case 'brutalist':
        return 'text-sm font-bold text-white mb-3 uppercase tracking-widest';
      case 'organic-flow':
        return 'text-sm font-semibold text-white/80 mb-3 tracking-wider';
      default:
        return 'text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider';
    }
  };

  // Get theme-specific block styles
  const getBlockStyle = (isFilled: boolean) => {
    if (!isFilled) {
      return { backgroundColor: 'transparent' };
    }

    switch (themeId) {
      case 'neon-tokyo':
        return {
          backgroundColor: color,
          boxShadow: `
            0 0 8px ${color},
            0 0 16px ${color}60,
            inset 2px 2px 4px rgba(255,255,255,0.3),
            inset -2px -2px 4px rgba(0,0,0,0.3)
          `,
          border: `1px solid ${color}`,
          borderRadius: '1px',
        };
      case 'brutalist':
        return {
          backgroundColor: color,
          boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
          border: '2px solid #000',
          borderRadius: '0',
        };
      case 'organic-flow':
        return {
          backgroundColor: color,
          boxShadow: `
            0 4px 12px rgba(31, 38, 135, 0.37),
            inset 2px 2px 4px rgba(255,255,255,0.4)
          `,
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '4px',
        };
      default:
        return {
          backgroundColor: color,
          boxShadow: `
            inset 2px 2px 4px rgba(255,255,255,0.3),
            inset -2px -2px 4px rgba(0,0,0,0.3),
            0 0 8px ${color}60
          `,
          border: `1px solid ${color}80`,
        };
    }
  };

  // Fixed grid size: 4 columns (widest piece is I-piece 4x1) x 4 rows (max height)
  const GRID_COLS = 4;
  const GRID_ROWS = 4;
  
  // Calculate offset to center the piece in the fixed grid
  const pieceWidth = trimmedShape[0]?.length || 1;
  const pieceHeight = trimmedShape.length || 1;
  const offsetX = Math.floor((GRID_COLS - pieceWidth) / 2);
  const offsetY = Math.floor((GRID_ROWS - pieceHeight) / 2);

  // Block size based on screen size
  const blockSize = themeId === 'brutalist' ? 20 : 16;
  const blockSizeSm = themeId === 'brutalist' ? 20 : 20;

  return (
    <div className={getContainerClass()}>
      <h3 className={getTitleClass()}>
        NASTĘPNY
      </h3>
      <div className="flex items-center justify-center" style={{ minHeight: `${GRID_ROWS * blockSize + (GRID_ROWS - 1) * 2}px` }}>
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            width: `${GRID_COLS * blockSize + (GRID_COLS - 1) * 2}px`,
            height: `${GRID_ROWS * blockSize + (GRID_ROWS - 1) * 2}px`,
          }}
        >
          {/* Render fixed grid cells */}
          {Array.from({ length: GRID_ROWS }).map((_, gridY) =>
            Array.from({ length: GRID_COLS }).map((_, gridX) => {
              // Calculate position in trimmed shape
              const shapeX = gridX - offsetX;
              const shapeY = gridY - offsetY;
              
              // Check if this grid cell should show a piece block
              const isInBounds = 
                shapeY >= 0 && 
                shapeY < trimmedShape.length &&
                shapeX >= 0 && 
                shapeX < trimmedShape[shapeY]?.length;
              
              const cell = isInBounds ? trimmedShape[shapeY][shapeX] : false;
              
              return (
                <div
                  key={`${gridY}-${gridX}`}
                  className="bg-transparent"
                  style={{
                    width: `${blockSize}px`,
                    height: `${blockSize}px`,
                    ...getBlockStyle(!!cell),
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

NextPiece.displayName = 'NextPiece';
