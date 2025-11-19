'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

interface MatchFoundData {
  opponent: string;
  roomId: string;
}

export type MatchmakingState = 'idle' | 'searching' | 'found' | 'timeout' | 'error';

export function useMatchmaking() {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [state, setState] = useState<MatchmakingState>('idle');
  const [queuePosition, setQueuePosition] = useState(0);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleQueueJoined = (data: { position: number }) => {
      setState('searching');
      setQueuePosition(data.position);
    };

    const handleQueueUpdate = (data: { position: number }) => {
      setQueuePosition(data.position);
    };

    const handleMatchFound = (data: MatchFoundData) => {
      setState('found');
      setMatchData(data);
    };

    const handleTimeout = () => {
      setState('timeout');
    };

    const handleError = (data: { message: string }) => {
      setState('error');
      setError(data.message);
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
  }, [socket, on, off]);

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
