'use client';

import React, { useState, useEffect } from 'react';

interface QueueStatusProps {
  nickname: string;
  queuePosition: number;
  onCancel: () => void;
  onTimeout: () => void;
}

export function QueueStatus({ nickname, queuePosition, onCancel, onTimeout }: QueueStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const maxWaitTime = 120; // 2 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= maxWaitTime) {
          onTimeout();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeout, maxWaitTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (elapsedTime / maxWaitTime) * 100;

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="terminal-panel p-4 mb-6">
        <h2 className="text-[var(--terminal-green)] text-xl font-mono font-bold text-center text-glow">
          SZUKAM PRZECIWNIKA...
        </h2>
      </div>

      {/* Progress bar */}
      <div className="terminal-progress mb-6 terminal-loading">
        <div
          className="terminal-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Player info */}
      <div className="terminal-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 bg-[var(--terminal-green)] rounded-full pulse-dot" />
          <span className="text-[var(--terminal-green)] font-mono font-bold">
            {nickname}
          </span>
        </div>

        <p className="text-[var(--terminal-gray)] text-sm font-mono mb-4">
          Oczekiwanie na mecz...
        </p>

        <div className="flex justify-between items-center text-sm font-mono">
          <span className="text-[var(--terminal-gray)]">
            ⏱ {formatTime(elapsedTime)}
          </span>
          <span className="text-[var(--terminal-gray)]">
            W KOLEJCE: {queuePosition} {queuePosition === 1 ? 'GRACZ' : 'GRACZY'}
          </span>
        </div>
      </div>

      {/* Cancel button */}
      <div className="mt-6 text-center">
        <button
          onClick={onCancel}
          className="terminal-button"
        >
          ANULUJ
        </button>
      </div>

      {/* Info */}
      <p className="text-[var(--terminal-gray)] text-xs font-mono text-center mt-4">
        {'> Maksymalny czas oczekiwania: 2 min'}
      </p>
    </div>
  );
}
