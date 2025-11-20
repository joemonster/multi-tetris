'use client';

import React, { useState, useEffect, useRef } from 'react';

interface GameTimerProps {
  isRunning: boolean;
  startTime?: number;
  maxDuration?: number; // Max duration in milliseconds (e.g., 5 * 60 * 1000)
  onTimeUpdate?: (seconds: number) => void;
  onTimeUp?: () => void; // Called when timer reaches 0
}

export function GameTimer({ isRunning, startTime, maxDuration = 300000, onTimeUpdate, onTimeUp }: GameTimerProps) {
  const [remainingTime, setRemainingTime] = useState(maxDuration);
  const startTimeRef = useRef<number | undefined>(undefined);
  const hasCalledTimeUpRef = useRef(false);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onTimeUpRef = useRef(onTimeUp);
  const maxDurationRef = useRef(maxDuration);

  // Keep refs updated
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onTimeUpRef.current = onTimeUp;
    maxDurationRef.current = maxDuration;
  }, [onTimeUpdate, onTimeUp, maxDuration]);

  // Update ref when startTime changes or when game restarts
  useEffect(() => {
    if (startTime && isRunning) {
      // Only update if it's a new startTime (different from current) or not set yet
      if (!startTimeRef.current || Math.abs(startTimeRef.current - startTime) > 1000) {
        startTimeRef.current = startTime;
        hasCalledTimeUpRef.current = false;
        // Reset remaining time when starting
        setRemainingTime(maxDurationRef.current);
      }
    }
  }, [startTime, isRunning]);

  useEffect(() => {
    if (!isRunning) {
      // Reset when stopped
      if (startTimeRef.current) {
        setRemainingTime(maxDurationRef.current);
      }
      return;
    }

    // Use startTime from ref, or fallback to local time if not yet received
    const localStartTime = startTimeRef.current || Date.now();
    
    // If we don't have a startTime yet, set it now
    if (!startTimeRef.current) {
      startTimeRef.current = localStartTime;
    }

    const updateTime = () => {
      const now = Date.now();
      const elapsed = now - localStartTime;
      const remaining = Math.max(0, maxDurationRef.current - elapsed);

      setRemainingTime(remaining);
      onTimeUpdateRef.current?.(Math.floor(elapsed / 1000));

      // Call onTimeUp when timer reaches 0
      if (remaining <= 0 && !hasCalledTimeUpRef.current) {
        hasCalledTimeUpRef.current = true;
        onTimeUpRef.current?.();
      }
    };

    // Update immediately
    updateTime();

    // Use setInterval (not RAF) - works even when tab is not focused
    const interval = setInterval(updateTime, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on remaining time
  const getTimerColor = () => {
    const remainingSeconds = Math.floor(remainingTime / 1000);
    if (remainingSeconds <= 0) return 'text-[var(--terminal-orange)]';
    if (remainingSeconds <= 30) return 'text-[var(--terminal-orange)]'; // Last 30 seconds
    return 'text-[var(--terminal-green)]';
  };

  return (
    <div className="text-center">
      <div className="text-xs text-[var(--terminal-gray)] mb-1 font-mono">
        Czas gry
      </div>
      <span className={`text-2xl font-mono font-bold text-glow ${getTimerColor()}`}>
        ⏱ {formatTime(remainingTime)}
      </span>
      {Math.floor(remainingTime / 1000) <= 30 && (
        <div className="text-xs text-[var(--terminal-orange)] font-mono mt-1 animate-pulse">
          Koniec gry za {Math.floor(remainingTime / 1000)}s
        </div>
      )}
    </div>
  );
}
