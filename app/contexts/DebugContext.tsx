'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DebugLog {
  id: string;
  timestamp: number;
  type: 'event' | 'sent' | 'received' | 'info';
  title: string;
  data?: unknown;
  color: 'green' | 'orange' | 'blue' | 'gray';
}

interface DebugContextType {
  logs: DebugLog[];
  onlineCount: number;
  addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setOnlineCount: (count: number) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const addLog = useCallback((log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    const newLog: DebugLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep only last 100 logs
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <DebugContext.Provider value={{ logs, onlineCount, addLog, clearLogs, setOnlineCount }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within DebugProvider');
  }
  return context;
}
