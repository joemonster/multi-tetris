'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueueStatus } from '../components/multiplayer/QueueStatus';
import { MatchFound } from '../components/multiplayer/MatchFound';
import { useMatchmaking } from '../hooks/multiplayer/useMatchmaking';
import { ServerStatusPanel } from '../components/debug/ServerStatusPanel';
import { useDebug } from '../contexts/DebugContext';

export default function QueuePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const {
    state,
    queuePosition,
    matchData,
    isConnected,
    findGame,
    cancelQueue,
    reset,
  } = useMatchmaking();

  // Load nickname: Priority: sessionStorage -> localStorage -> Random (save to session only)
  useEffect(() => {
    // 1. Check sessionStorage (current tab session)
    const sessionNick = sessionStorage.getItem('tetris_nickname');
    if (sessionNick) {
      setNickname(sessionNick);
      return;
    }

    // 2. Check localStorage (user preference)
    const localNick = localStorage.getItem('tetris_nickname');
    if (localNick) {
      setNickname(localNick);
      // Also cache in session for consistency
      sessionStorage.setItem('tetris_nickname', localNick);
      return;
    }

    // 3. Generate random if none saved
    const randomNick = `GRACZ_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setNickname(randomNick);
    // Only save random nick to session, don't pollute global preferences
    sessionStorage.setItem('tetris_nickname', randomNick);
  }, []);

  // Start searching when connected and nickname is set
  useEffect(() => {
    if (isConnected && nickname && state === 'idle') {
      findGame(nickname);
    }
  }, [isConnected, nickname, state, findGame]);

  // Handle cancel
  const handleCancel = () => {
    cancelQueue();
    router.push('/');
  };

  // Handle timeout
  const handleTimeout = () => {
    reset();
  };

  // Handle game start
  const handleGameStart = React.useCallback(() => {
    if (matchData && matchData.roomId) {
      // Opponent nickname will be set from server when game starts
      router.push(`/game/${matchData.roomId}`);
    }
  }, [matchData, router]);

  // Handle retry
  const handleRetry = () => {
    reset();
    if (nickname) {
      findGame(nickname);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-terminal)] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center w-full">
      {/* Match found overlay */}
      {state === 'found' && matchData && (
        <MatchFound
          playerNickname={nickname}
          opponentNickname={matchData.opponent}
          matchFoundTime={matchData.matchFoundTime}
          onStart={handleGameStart}
        />
      )}

      {/* Searching state */}
      {state === 'searching' && (
        <QueueStatus
          nickname={nickname}
          queuePosition={queuePosition}
          onCancel={handleCancel}
          onTimeout={handleTimeout}
        />
      )}

      {/* Timeout state */}
      {state === 'timeout' && (
        <div className="text-center">
          <div className="terminal-panel p-4 mb-6">
            <h2 className="text-[var(--terminal-orange)] text-xl font-mono font-bold">
              ! NIE ZNALEZIONO PRZECIWNIKA
            </h2>
          </div>

          <div className="flex gap-4">
            <button onClick={handleRetry} className="terminal-button">
              SPRÓBUJ PONOWNIE
            </button>
            <button
              onClick={() => router.push('/game/solo')}
              className="terminal-button"
            >
              TRENING
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="text-center">
          <div className="terminal-panel p-4 mb-6">
            <h2 className="text-[var(--terminal-red)] text-xl font-mono font-bold">
              ! BŁĄD POŁĄCZENIA
            </h2>
          </div>

          <p className="text-[var(--terminal-gray)] font-mono mb-4">
            Nie można połączyć z serwerem gry.
          </p>

          <div className="flex gap-4">
            <button onClick={handleRetry} className="terminal-button">
              SPRÓBUJ PONOWNIE
            </button>
            <button
              onClick={() => router.push('/')}
              className="terminal-button"
            >
              POWRÓT
            </button>
          </div>
        </div>
      )}

      {/* Connecting state */}
      {state === 'idle' && !isConnected && (
        <div className="text-center">
          <div className="terminal-panel p-4">
            <h2 className="text-[var(--terminal-green)] text-xl font-mono font-bold flicker">
              ŁĄCZENIE Z SERWEREM...
            </h2>
          </div>
        </div>
      )}
      </div>

      {/* Debug Panel Sidebar */}
      <ServerStatusPanel />
    </div>
  );
}
