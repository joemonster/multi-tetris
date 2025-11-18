'use client';

import React from 'react';
import { TetrominoType } from '../types/game.types';
import { TETROMINOS } from '../utils/tetrominos';

interface NextPieceProps {
  pieceType: TetrominoType;
}

export const NextPiece: React.FC<NextPieceProps> = React.memo(({ pieceType }) => {
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

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Next
      </h3>
      <div className="flex items-center justify-center min-h-[80px]">
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${trimmedShape[0]?.length || 1}, 1fr)`,
          }}
        >
          {trimmedShape.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`
                  w-4 h-4 sm:w-5 sm:h-5
                  ${cell ? '' : 'bg-transparent'}
                `}
                style={{
                  backgroundColor: cell ? color : 'transparent',
                  boxShadow: cell
                    ? `inset 2px 2px 4px rgba(255,255,255,0.3),
                       inset -2px -2px 4px rgba(0,0,0,0.3),
                       0 0 8px ${color}60`
                    : undefined,
                  border: cell ? `1px solid ${color}80` : undefined,
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

NextPiece.displayName = 'NextPiece';
