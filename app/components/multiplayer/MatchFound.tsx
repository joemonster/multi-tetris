'use client';

import React, { useState, useEffect, useRef } from 'react';

interface MatchFoundProps {
  playerNickname: string;
  opponentNickname: string;
  matchFoundTime?: number; // Server time when match was found
  onStart: () => void;
}

export function MatchFound({ playerNickname, opponentNickname, matchFoundTime, onStart }: MatchFoundProps) {
  const [countdown, setCountdown] = useState(3);
  const onStartRef = useRef(onStart);
  const hasStartedRef = useRef(false);

  // Keep ref updated
  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    // Prevent multiple calls
    if (hasStartedRef.current) return;

    // If we have server time, use it for synchronized countdown
    if (matchFoundTime) {
      const updateCountdown = () => {
        if (hasStartedRef.current) return;
        
        const now = Date.now();
        const elapsed = now - matchFoundTime;
        const remaining = Math.max(0, 3000 - elapsed);
        const newCountdown = Math.ceil(remaining / 1000);

        if (newCountdown <= 0 && !hasStartedRef.current) {
          hasStartedRef.current = true;
          onStartRef.current();
        } else {
          setCountdown(newCountdown);
        }
      };

      // Update immediately
      updateCountdown();

      // Update every 100ms for smooth countdown
      const interval = setInterval(updateCountdown, 100);

      // Safety timeout - force start after 4 seconds max
      const safetyTimeout = setTimeout(() => {
        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
          onStartRef.current();
        }
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(safetyTimeout);
      };
    } else {
      // Fallback to local countdown if no server time
      if (countdown <= 0 && !hasStartedRef.current) {
        hasStartedRef.current = true;
        onStartRef.current();
        return;
      }

      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      // Safety timeout for fallback
      const safetyTimeout = setTimeout(() => {
        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
          onStartRef.current();
        }
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(safetyTimeout);
      };
    }
  }, [matchFoundTime, countdown]);

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
