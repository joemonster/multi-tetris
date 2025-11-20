'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface GameEndModalProps {
  winner: string;
  reason: string;
  playerNickname: string;
  playerScore: number;
  playerLines: number;
  playerLevel: number;
  opponentScore: number;
  opponentLines: number;
  opponentLevel: number;
  onRematchRequest: () => void;
  onReturnToLobby: () => void;
  rematchRequest?: {
    playerId: string;
    playerNickname: string;
  } | null;
  rematchTimeout?: number;
  onRematchAccept?: () => void;
  onRematchReject?: () => void;
}

export function GameEndModal({
  winner,
  reason,
  playerNickname,
  playerScore,
  playerLines,
  playerLevel,
  opponentScore,
  opponentLines,
  opponentLevel,
  onRematchRequest,
  onReturnToLobby,
  rematchRequest,
  rematchTimeout,
  onRematchAccept,
  onRematchReject,
}: GameEndModalProps) {
  const isWinner = winner === playerNickname;

  return (
    <div className="fixed inset-0 bg-[var(--bg-terminal)]/95 flex items-center justify-center z-50">
      <div className="terminal-panel p-8 text-center max-w-2xl w-full mx-4">
        {/* Header */}
        <h2 className={`text-3xl font-mono font-bold mb-4 text-glow ${
          isWinner ? 'text-[var(--terminal-green)]' : 'text-[var(--terminal-orange)]'
        }`}>
          {isWinner ? '🏆 ZWYCIĘSTWO!' : '💀 PORAŻKA'}
        </h2>

        <p className="text-[var(--terminal-gray)] font-mono text-sm mb-6">
          {reason}
        </p>

        {/* Stats Comparison */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Player Stats */}
          <div className="terminal-panel p-4">
            <div className={`text-lg font-mono font-bold mb-3 ${
              isWinner ? 'text-[var(--terminal-green)]' : 'text-[var(--terminal-gray)]'
            }`}>
              {playerNickname}
              {isWinner && ' 👑'}
            </div>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--terminal-gray)]">Score:</span>
                <span className="text-[var(--terminal-green)] font-bold">{playerScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--terminal-gray)]">Linie:</span>
                <span className="text-[var(--terminal-green)]">{playerLines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--terminal-gray)]">Level:</span>
                <span className="text-[var(--terminal-green)]">{playerLevel}</span>
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <span className="text-4xl font-mono text-[var(--terminal-gray)]">VS</span>
          </div>

          {/* Opponent Stats */}
          <div className="terminal-panel p-4">
            <div className={`text-lg font-mono font-bold mb-3 ${
              !isWinner ? 'text-[var(--terminal-green)]' : 'text-[var(--terminal-gray)]'
            }`}>
              {winner}
              {!isWinner && ' 👑'}
            </div>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--terminal-gray)]">Score:</span>
                <span className="text-[var(--terminal-green)] font-bold">{opponentScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--terminal-gray)]">Linie:</span>
                <span className="text-[var(--terminal-green)]">{opponentLines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--terminal-gray)]">Level:</span>
                <span className="text-[var(--terminal-green)]">{opponentLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rematch Request Display */}
        {rematchRequest && (
          <div className="terminal-panel p-4 mb-6 bg-[var(--terminal-orange)]/10 border-[var(--terminal-orange)]">
            <div className="text-[var(--terminal-orange)] font-mono font-bold mb-3">
              {rematchRequest.playerNickname} chce grać ponownie!
            </div>
            <div className="text-[var(--terminal-gray)] font-mono text-sm mb-4">
              Odpowiedz w ciągu {rematchTimeout}s
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onRematchAccept}
                className="terminal-button bg-[var(--terminal-green)]/20 hover:bg-[var(--terminal-green)]/30"
              >
                ✓ AKCEPTUJ
              </button>
              <button
                onClick={onRematchReject}
                className="terminal-button bg-[var(--terminal-orange)]/20 hover:bg-[var(--terminal-orange)]/30"
              >
                ✗ ODRZUĆ
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!rematchRequest && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={onRematchRequest}
              className="terminal-button text-lg px-8"
            >
              🔄 GRAJ PONOWNIE
            </button>
            <button
              onClick={onReturnToLobby}
              className="terminal-button text-lg px-8"
            >
              🏠 WRÓĆ DO LOBBY
            </button>
          </div>
        )}

        {/* Hint */}
        <div className="mt-6 text-[var(--terminal-gray)] font-mono text-xs">
          Naciśnij ESC aby wrócić do lobby
        </div>
      </div>
    </div>
  );
}
