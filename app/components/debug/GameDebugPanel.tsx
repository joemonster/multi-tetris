'use client';

import React, { useState } from 'react';
import { useDebug } from '../../contexts/DebugContext';

const COLOR_MAP = {
  green: 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]',
  orange: 'bg-[var(--terminal-orange)]/10 border-[var(--terminal-orange)]',
  blue: 'bg-[var(--terminal-blue)]/10 border-[var(--terminal-blue)]',
  gray: 'bg-[var(--terminal-gray)]/10 border-[var(--terminal-gray)]',
};

const TEXT_COLOR_MAP = {
  green: 'text-[var(--terminal-green)]',
  orange: 'text-[var(--terminal-orange)]',
  blue: 'text-[var(--terminal-blue)]',
  gray: 'text-[var(--terminal-gray)]',
};

export function GameDebugPanel() {
  const { logs, onlineCount, clearLogs } = useDebug();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
        isExpanded ? 'w-96 h-96' : 'w-32'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full terminal-button mb-2 text-xs py-2"
      >
        {isExpanded ? '[ - ] DEBUG' : '[ + ] DEBUG'}
      </button>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="terminal-panel p-3 h-full flex flex-col bg-[var(--bg-terminal)]/95 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--terminal-green)]">
            <span className="text-[var(--terminal-green)] font-mono text-xs font-bold text-glow">
              &gt; SERVER MONITOR
            </span>
            <button
              onClick={clearLogs}
              className="text-[var(--terminal-orange)] font-mono text-xs hover:text-[var(--terminal-green)] transition-colors"
            >
              [WYCZYŚĆ]
            </button>
          </div>

          {/* Stats */}
          <div className="text-[var(--terminal-gray)] font-mono text-xs space-y-1 mb-3 pb-2 border-b border-[var(--terminal-gray)]/20">
            <div>Gracze: <span className="text-[var(--terminal-green)] font-bold">{onlineCount}</span></div>
            <div>Logi: <span className="text-[var(--terminal-green)] font-bold">{logs.length}/100</span></div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <div className="text-[var(--terminal-gray)] text-xs">
                Oczekiwanie...
              </div>
            ) : (
              logs.slice(0, 15).map((log) => (
                <div
                  key={log.id}
                  className={`border border-l-4 rounded px-2 py-1 text-xs font-mono ${COLOR_MAP[log.color]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className={`font-bold break-words ${TEXT_COLOR_MAP[log.color]}`}>
                        {log.title}
                      </div>
                      {log.data !== undefined && log.data !== null && (
                        <div className="text-[var(--terminal-gray)] text-xs mt-0.5 break-words max-h-12 overflow-hidden">
                          {(() => {
                            const data = log.data as unknown;
                            return typeof data === 'string'
                              ? (data as string).substring(0, 80)
                              : JSON.stringify(data as Record<string, unknown>).substring(0, 80);
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="text-[var(--terminal-gray)] text-xs whitespace-nowrap">
                      {formatTime(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
