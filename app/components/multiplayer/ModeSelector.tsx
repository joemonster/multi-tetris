'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ModeSelectorProps {
  nickname: string;
}

export function ModeSelector({ nickname }: ModeSelectorProps) {
  const router = useRouter();

  const handleMultiplayer = () => {
    if (!nickname || nickname.length < 3) {
      // Generate random nickname if empty
      const randomNick = `GRACZ_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      localStorage.setItem('tetris_nickname', randomNick);
    }
    router.push('/queue');
  };

  const handleSolo = () => {
    router.push('/game/solo');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
      {/* Multiplayer Card */}
      <button
        onClick={handleMultiplayer}
        className="terminal-card flex-1 text-left group"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚔</span>
          <h3 className="terminal-card-title text-[var(--terminal-green)] text-lg font-mono font-bold">
            MULTIPLAYER
          </h3>
        </div>
        <p className="text-[var(--terminal-gray)] text-sm font-mono">
          Walcz online z innymi graczami
        </p>
        <div className="mt-4 text-[var(--terminal-green)] text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {'> NACIŚNIJ ABY DOŁĄCZYĆ'}
        </div>
      </button>

      {/* Solo Card */}
      <button
        onClick={handleSolo}
        className="terminal-card flex-1 text-left group"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">◎</span>
          <h3 className="terminal-card-title text-[var(--terminal-green)] text-lg font-mono font-bold">
            TRENING
          </h3>
        </div>
        <p className="text-[var(--terminal-gray)] text-sm font-mono">
          Graj solo i ćwicz umiejętności
        </p>
        <div className="mt-4 text-[var(--terminal-green)] text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {'> NACIŚNIJ ABY GRAĆ'}
        </div>
      </button>
    </div>
  );
}
