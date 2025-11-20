'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import PartySocket from 'partysocket';
import { getSocket, disconnectSocket } from '../../lib/socket/client';
import { useDebug } from '../../contexts/DebugContext';

interface MessageHandler {
  [key: string]: (data: unknown) => void;
}

export function useSocket() {
  const [socket, setSocket] = useState<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const handlersRef = useRef<MessageHandler>({});
  const { addLog, setOnlineCount: setDebugOnlineCount } = useDebug();

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onOpen = () => {
      setIsConnected(true);
      setError(null);
      addLog({
        type: 'event',
        title: 'Połączenie nawiązane',
        color: 'green',
      });
    };

    const onClose = () => {
      setIsConnected(false);
      addLog({
        type: 'event',
        title: 'Połączenie zamknięte',
        color: 'orange',
      });
    };

    const onError = () => {
      setError('Błąd połączenia');
      addLog({
        type: 'event',
        title: 'Błąd połączenia',
        color: 'orange',
      });
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Handle online_count specially
        if (data.type === 'online_count') {
          setOnlineCount(data.count);
          setDebugOnlineCount(data.count);
          addLog({
            type: 'info',
            title: `Gracze online: ${data.count}`,
            color: 'blue',
          });
        } else {
          addLog({
            type: 'received',
            title: `Odebrano: ${data.type}`,
            data: data,
            color: 'blue',
          });
        }

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
  }, [addLog]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
    addLog({
      type: 'event',
      title: 'Rozłączono',
      color: 'orange',
    });
  }, [addLog]);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socket?.readyState === WebSocket.OPEN) {
      const message = {
        type: event,
        ...(data as object || {})
      };
      socket.send(JSON.stringify(message));
      addLog({
        type: 'sent',
        title: `Wysłano: ${event}`,
        data: message,
        color: 'green',
      });
    }
  }, [socket, addLog]);

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
    onlineCount,
    emit,
    on,
    off,
    disconnect,
  };
}
