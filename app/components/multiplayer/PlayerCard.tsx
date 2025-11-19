'use client';

import React from 'react';

interface PlayerCardProps {
  nickname: string;
  score: number;
  lines: number;
  isCurrentPlayer?: boolean;
  isLeading?: boolean;
}

export function PlayerCard({ nickname, score, lines, isCurrentPlayer = false, isLeading = false }: PlayerCardProps) {
  return (
    <div className={`terminal-panel p-3 ${isLeading ? 'border-[var(--terminal-green)]' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {isCurrentPlayer && (
          <span className="w-2 h-2 bg-[var(--terminal-green)] rounded-full pulse-dot" />
        )}
        <span className={`font-mono font-bold text-sm ${
          isLeading ? 'text-[var(--terminal-green)] text-glow' : 'text-[var(--terminal-gray)]'
        }`}>
          {nickname}
        </span>
        {isLeading && (
          <span className="text-[var(--terminal-green)] text-xs font-mono ml-auto">
            ▲
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <span className="text-[var(--terminal-gray)]">LINIE: </span>
          <span className="text-[var(--terminal-green)]">{lines}</span>
        </div>
        <div>
          <span className="text-[var(--terminal-gray)]">WYNIK: </span>
          <span className="text-[var(--terminal-green)]">{score}</span>
        </div>
      </div>
    </div>
  );
}
