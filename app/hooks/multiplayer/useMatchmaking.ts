'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useDebug } from '../../contexts/DebugContext';

interface MatchFoundData {
  opponent: string;
  roomId: string;
  matchFoundTime?: number;
}

export type MatchmakingState = 'idle' | 'searching' | 'found' | 'timeout' | 'error';

export function useMatchmaking() {
  const { socket, isConnected, emit, on, off } = useSocket();
  const { addLog } = useDebug();
  const [state, setState] = useState<MatchmakingState>('idle');
  const [queuePosition, setQueuePosition] = useState(0);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleQueueJoined = (data: { position: number }) => {
      setState('searching');
      setQueuePosition(data.position);
      addLog({
        type: 'event',
        title: `Dołączono do kolejki (pozycja: ${data.position})`,
        color: 'green',
      });
    };

    const handleQueueUpdate = (data: { position: number }) => {
      setQueuePosition(data.position);
      addLog({
        type: 'event',
        title: `Aktualizacja pozycji (${data.position})`,
        color: 'blue',
      });
    };

    const handleMatchFound = (data: MatchFoundData) => {
      setState('found');
      // Use local time to avoid clock skew
      setMatchData({ ...data, matchFoundTime: Date.now() });
      addLog({
        type: 'event',
        title: `Match znaleziony! vs ${data.opponent}`,
        data: { roomId: data.roomId },
        color: 'green',
      });
    };

    const handleTimeout = () => {
      setState('timeout');
      addLog({
        type: 'event',
        title: 'Timeout - nie znaleziono przeciwnika',
        color: 'orange',
      });
    };

    const handleError = (data: { message: string }) => {
      setState('error');
      setError(data.message);
      addLog({
        type: 'event',
        title: 'Błąd matchmakingu',
        data: { message: data.message },
        color: 'orange',
      });
    };

    on('queue_joined', handleQueueJoined);
    on('queue_update', handleQueueUpdate);
    on('match_found', handleMatchFound);
    on('queue_timeout', handleTimeout);
    on('error', handleError);

    return () => {
      off('queue_joined');
      off('queue_update');
      off('match_found');
      off('queue_timeout');
      off('error');
    };
  }, [socket, on, off, addLog]);

  const findGame = useCallback((nickname: string) => {
    if (!isConnected) {
      setError('Brak połączenia z serwerem');
      setState('error');
      return;
    }

    setState('searching');
    emit('find_game', { nickname });
  }, [isConnected, emit]);

  const cancelQueue = useCallback(() => {
    emit('cancel_queue');
    setState('idle');
    setQueuePosition(0);
    setMatchData(null);
  }, [emit]);

  const reset = useCallback(() => {
    setState('idle');
    setQueuePosition(0);
    setMatchData(null);
    setError(null);
  }, []);

  return {
    state,
    queuePosition,
    matchData,
    error,
    isConnected,
    findGame,
    cancelQueue,
    reset,
  };
}
