'use client';

import React, { useMemo } from 'react';
import { useDebug } from '../../contexts/DebugContext';

const COLOR_MAP = {
  green: 'text-[var(--terminal-green)]',
  orange: 'text-[var(--terminal-orange)]',
  blue: 'text-[var(--terminal-blue)]',
  gray: 'text-[var(--terminal-gray)]',
};

export function ServerStatusPanel() {
  const { logs, onlineCount } = useDebug();

  // Get last events of each type
  const recentEvents = useMemo(() => {
    const eventsByType = new Map<string, typeof logs[0]>();
    logs.forEach((log) => {
      if (!eventsByType.has(log.title)) {
        eventsByType.set(log.title, log);
      }
    });
    return Array.from(eventsByType.values()).slice(0, 8);
  }, [logs]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 1000) return 'teraz';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s temu`;
    return `${Math.floor(diff / 60000)}m temu`;
  };

  return (
    <div className="w-80 bg-[var(--bg-terminal)] border-l border-[var(--terminal-green)] p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-[var(--terminal-green)]">
        <div className="text-[var(--terminal-green)] font-mono text-sm font-bold text-glow mb-2">
          &gt; SERVER STATUS
        </div>
        <div className="text-[var(--terminal-gray)] font-mono text-xs space-y-1">
          <div>Gracze online: <span className="text-[var(--terminal-green)]">{onlineCount}</span></div>
          <div>Logi: <span className="text-[var(--terminal-green)]">{logs.length}/100</span></div>
        </div>
      </div>

      {/* Events Log */}
      <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-[var(--terminal-gray)]">
            Oczekiwanie na zdarzenia...
          </div>
        ) : (
          logs.slice(0, 20).map((log) => (
            <div
              key={log.id}
              className="bg-[var(--bg-terminal)] border border-[var(--terminal-gray)] p-2 rounded"
            >
              <div className={`flex items-start justify-between ${COLOR_MAP[log.color]}`}>
                <div className="flex-1">
                  <div className="font-bold break-words">{log.title}</div>
                  {log.data !== undefined && log.data !== null && (
                    <div className="text-[var(--terminal-gray)] mt-1 break-words">
                      {(() => {
                        const data = log.data as unknown;
                        return typeof data === 'object'
                          ? JSON.stringify(data as Record<string, unknown>).substring(0, 100)
                          : String(data).substring(0, 100);
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[var(--terminal-gray)] text-xs mt-1">
                {formatTime(log.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
