'use client';

import React, { useState, useEffect } from 'react';

interface GameTimerProps {
  isRunning: boolean;
  startTime?: number;
  onTimeUpdate?: (seconds: number) => void;
}

export function GameTimer({ isRunning, startTime, onTimeUpdate }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    // Use requestAnimationFrame for smoother updates and to work when tab is not focused
    let lastUpdate = Date.now();

    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);

      // Only update if time actually changed
      if (elapsed !== Math.floor((lastUpdate - startTime) / 1000)) {
        setElapsedTime(elapsed);
        onTimeUpdate?.(elapsed);
      }
      lastUpdate = now;
    };

    // Update immediately
    updateTime();

    // Update on each animation frame
    let animationId: number;
    const tick = () => {
      updateTime();
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, [isRunning, startTime, onTimeUpdate]);

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
