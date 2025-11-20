'use client';

import React, { useState, useEffect } from 'react';

interface MatchFoundProps {
  playerNickname: string;
  opponentNickname: string;
  matchFoundTime?: number; // Server time when match was found
  onStart: () => void;
}

export function MatchFound({ playerNickname, opponentNickname, matchFoundTime, onStart }: MatchFoundProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // If we have server time, use it for synchronized countdown
    if (matchFoundTime) {
      const updateCountdown = () => {
        const now = Date.now();
        const elapsed = now - matchFoundTime;
        const remaining = Math.max(0, 3000 - elapsed);
        const newCountdown = Math.ceil(remaining / 1000);

        if (newCountdown <= 0) {
          onStart();
        } else {
          setCountdown(newCountdown);
        }
      };

      // Update immediately
      updateCountdown();

      // Update every 100ms for smooth countdown
      const interval = setInterval(updateCountdown, 100);

      return () => clearInterval(interval);
    } else {
      // Fallback to local countdown if no server time
      if (countdown <= 0) {
        onStart();
        return;
      }

      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [matchFoundTime, countdown, onStart]);

  return (
    <div className="fixed inset-0 bg-[var(--bg-terminal)]/95 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Header */}
        <div className="terminal-panel p-4 mb-8">
          <h2 className="text-[var(--terminal-green)] text-xl font-mono font-bold text-glow">
            {'> PRZECIWNIK ZNALEZIONY!'}
          </h2>
        </div>

        {/* VS Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-[var(--terminal-gray)] text-sm font-mono mb-2">TY</p>
            <p className="text-[var(--terminal-green)] text-lg font-mono font-bold">
              {playerNickname}
            </p>
          </div>

          <span className="vs-text flicker">VS</span>

          <div className="text-center">
            <p className="text-[var(--terminal-gray)] text-sm font-mono mb-2">PRZECIWNIK</p>
            <p className="text-[var(--terminal-green)] text-lg font-mono font-bold">
              {opponentNickname}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center">
          <p className="text-[var(--terminal-gray)] text-sm font-mono mb-2">
            START ZA...
          </p>
          <p className="text-[var(--terminal-green)] text-6xl font-mono font-bold countdown-number">
            {countdown}
          </p>
        </div>
      </div>
    </div>
  );
}
