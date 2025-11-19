'use client';

import React, { useState, useEffect } from 'react';

interface DisconnectWarningProps {
  onExit: () => void;
  onTimeout: () => void;
}

export function DisconnectWarning({ onExit, onTimeout }: DisconnectWarningProps) {
  const [remainingTime, setRemainingTime] = useState(60);
  const maxTime = 60;

  useEffect(() => {
    if (remainingTime <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, onTimeout]);

  const progressPercent = (remainingTime / maxTime) * 100;

  return (
    <div className="terminal-toast max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--terminal-orange)]">!</span>
        <h3 className="text-[var(--terminal-orange)] font-mono font-bold text-sm">
          PRZECIWNIK SIĘ ROZŁĄCZYŁ
        </h3>
      </div>

      {/* Message */}
      <p className="text-[var(--terminal-gray)] text-xs font-mono mb-3">
        Oczekiwanie na ponowne połączenie...
      </p>

      {/* Progress bar */}
      <div className="terminal-progress mb-3">
        <div
          className="h-full bg-[var(--terminal-orange)] transition-all duration-1000"
          style={{
            width: `${progressPercent}%`,
            boxShadow: '0 0 10px rgba(255, 170, 0, 0.5)'
          }}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between">
        <span className="text-[var(--terminal-gray)] text-xs font-mono">
          ({remainingTime}s)
        </span>
        <button
          onClick={onExit}
          className="text-[var(--terminal-orange)] text-xs font-mono hover:underline"
        >
          [WYJDŹ]
        </button>
      </div>
    </div>
  );
}
