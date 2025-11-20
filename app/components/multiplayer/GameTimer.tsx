'use client';

import React, { useState, useEffect, useRef } from 'react';

interface GameTimerProps {
  isRunning: boolean;
  startTime?: number;
  onTimeUpdate?: (seconds: number) => void;
}

export function GameTimer({ isRunning, startTime, onTimeUpdate }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef(0);

  // Update ref when startTime changes
  useEffect(() => {
    if (startTime) {
      startTimeRef.current = startTime;
      // Reset last update when start time is received
      lastUpdateRef.current = Date.now();
    }
  }, [startTime]);

  useEffect(() => {
    if (!isRunning) return;

    // Start local timer even if startTime not yet received
    let localStartTime = startTimeRef.current || Date.now();
    let interval: NodeJS.Timeout;

    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - localStartTime) / 1000);

      setElapsedTime(elapsed);
      onTimeUpdate?.(elapsed);
    };

    // Update immediately
    updateTime();

    // Use setInterval (not RAF) - works even when tab is not focused
    interval = setInterval(updateTime, 100);

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
