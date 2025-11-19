'use client';

import React, { useState, useEffect } from 'react';

interface GameTimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function GameTimer({ isRunning, onTimeUpdate }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <span className="text-[var(--terminal-green)] text-2xl font-mono font-bold text-glow">
        ⏱ {formatTime(elapsedTime)}
      </span>
    </div>
  );
}
