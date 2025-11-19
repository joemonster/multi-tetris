'use client';

import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from '../../lib/socket/client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onError = (err: Error) => {
      setError(err.message);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);

    // Check if already connected
    if (s.connected) {
      setIsConnected(true);
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onError);
    };
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, [socket]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
  }, [socket]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (callback) {
      socket?.off(event, callback);
    } else {
      socket?.off(event);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    error,
    emit,
    on,
    off,
    disconnect,
  };
}
