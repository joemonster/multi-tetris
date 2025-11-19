'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import PartySocket from 'partysocket';
import { getSocket, disconnectSocket } from '../../lib/socket/client';

interface MessageHandler {
  [key: string]: (data: unknown) => void;
}

export function useSocket() {
  const [socket, setSocket] = useState<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlersRef = useRef<MessageHandler>({});

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onOpen = () => {
      setIsConnected(true);
      setError(null);
    };

    const onClose = () => {
      setIsConnected(false);
    };

    const onError = () => {
      setError('Błąd połączenia');
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const handler = handlersRef.current[data.type];
        if (handler) {
          handler(data);
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    s.addEventListener('open', onOpen);
    s.addEventListener('close', onClose);
    s.addEventListener('error', onError);
    s.addEventListener('message', onMessage);

    // Check if already connected
    if (s.readyState === WebSocket.OPEN) {
      setIsConnected(true);
    }

    return () => {
      s.removeEventListener('open', onOpen);
      s.removeEventListener('close', onClose);
      s.removeEventListener('error', onError);
      s.removeEventListener('message', onMessage);
    };
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socket?.readyState === WebSocket.OPEN) {
      const message = {
        type: event,
        ...(data as object || {})
      };
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    handlersRef.current[event] = callback as (data: unknown) => void;
    return () => {
      delete handlersRef.current[event];
    };
  }, []);

  const off = useCallback((event: string) => {
    delete handlersRef.current[event];
  }, []);

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
