'use client';

import React, { useState, useEffect } from 'react';
import { ModeSelector } from './components/multiplayer/ModeSelector';
import { useSocket } from './hooks/multiplayer/useSocket';
import { ServerStatusPanel } from './components/debug/ServerStatusPanel';
import { useDebug } from './contexts/DebugContext';

export default function LandingPage() {
  const { isConnected, onlineCount } = useSocket();

  return (
    <div className="min-h-screen bg-[var(--bg-terminal)] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center w-full">
      {/* ASCII Art Logo */}
      <div className="terminal-panel p-6 mb-8 text-center">
        <pre className="text-[var(--terminal-green)] font-mono text-xs sm:text-sm leading-tight text-glow">
{`████████╗███████╗████████╗██████╗ ██╗███████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
   ██║   █████╗     ██║   ██████╔╝██║███████╗
   ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║
   ██║   ███████╗   ██║   ██║  ██║██║███████║
   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝`}
        </pre>
        <p className="text-[var(--terminal-green)] font-mono text-lg mt-4 flicker">
          BATTLE ARENA v2.0
        </p>
      </div>

      {/* Mode Selection */}
      <ModeSelector />

      {/* Quick links */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => {/* TODO: Stats page */}}
          className="text-[var(--terminal-gray)] font-mono text-sm hover:text-[var(--terminal-green)] transition-colors"
        >
          [STATYSTYKI]
        </button>
        <button
          onClick={() => {/* TODO: History page */}}
          className="text-[var(--terminal-gray)] font-mono text-sm hover:text-[var(--terminal-green)] transition-colors"
        >
          [HISTORIA]
        </button>
      </div>

      {/* Status bar */}
      <div className="mt-8 w-full max-w-md">
        <div className="terminal-panel p-3">
          <div className="flex items-center justify-between font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[var(--terminal-gray)]">{'> STATUS:'}</span>
              {isConnected ? (
                <>
                  <span className="text-[var(--terminal-green)]">ONLINE</span>
                  <span className="w-2 h-2 bg-[var(--terminal-green)] rounded-full pulse-dot" />
                </>
              ) : (
                <>
                  <span className="text-[var(--terminal-orange)]">ŁĄCZENIE...</span>
                  <span className="w-2 h-2 bg-[var(--terminal-orange)] rounded-full pulse-dot" />
                </>
              )}
            </div>
            <span className="text-[var(--terminal-gray)]">
              {onlineCount} {onlineCount === 1 ? 'GRACZ' : 'GRACZY'} ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[var(--terminal-gray)] font-mono text-xs text-center">
        <p>Sterowanie: Strzałki / WASD | Spacja = Hard Drop | P = Pauza</p>
        <p className="mt-1">© 2024 TETRIS BATTLE ARENA</p>
      </div>
      </div>

      {/* Debug Panel Sidebar */}
      <ServerStatusPanel />
    </div>
  );
}
