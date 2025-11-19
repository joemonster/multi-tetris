'use client';

import React from 'react';
import { Cell } from '../../types/game.types';

interface OpponentBoardProps {
  board: Cell[][];
  nickname: string;
  score: number;
  lines: number;
  isLeading?: boolean;
}

export function OpponentBoard({ board, nickname, score, lines, isLeading = false }: OpponentBoardProps) {
  return (
    <div className="terminal-panel p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono font-bold text-sm ${
          isLeading ? 'text-[var(--terminal-green)] text-glow' : 'text-[var(--terminal-gray)]'
        }`}>
          {nickname}
        </span>
        {isLeading && (
          <span className="text-[var(--terminal-green)] text-xs font-mono">▲</span>
        )}
      </div>

      {/* Mini board */}
      <div
        className="border border-[var(--terminal-border)] bg-[var(--bg-terminal)] mb-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${board[0]?.length || 10}, 1fr)`,
          gap: '0px',
          width: '120px',
          height: '240px'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                ${cell.filled
                  ? 'bg-[var(--terminal-green)]'
                  : 'bg-transparent'
                }
              `}
              style={{
                boxShadow: cell.filled ? '0 0 2px var(--terminal-glow)' : 'none'
              }}
            />
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1 text-xs font-mono">
        <div>
          <span className="text-[var(--terminal-gray)]">L:</span>
          <span className="text-[var(--terminal-green)]">{lines}</span>
        </div>
        <div>
          <span className="text-[var(--terminal-gray)]">S:</span>
          <span className="text-[var(--terminal-green)]">{score}</span>
        </div>
      </div>
    </div>
  );
}
