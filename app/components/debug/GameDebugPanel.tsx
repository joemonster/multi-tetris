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
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatData = (data: unknown): string => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const handleLogClick = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div
      className={`fixed right-0 top-0 z-40 transition-all duration-300 ${
        isExpanded ? 'w-80 h-screen' : 'w-12'
      } bg-[var(--bg-terminal)] border-l border-[var(--terminal-green)] overflow-hidden`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full terminal-button text-xs py-2 ${isExpanded ? 'mb-2' : 'h-full flex items-center justify-center'}`}
      >
        {isExpanded ? '[ - ] DEBUG' : (
          <span className="[writing-mode:vertical-rl] text-center">[ + ] DEBUG</span>
        )}
      </button>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--terminal-green)]">
            <span className="text-[var(--terminal-green)] font-mono text-sm font-bold text-glow">
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
          <div className="text-[var(--terminal-gray)] font-mono text-xs space-y-1 mb-4 pb-3 border-b border-[var(--terminal-gray)]/20">
            <div>Gracze: <span className="text-[var(--terminal-green)] font-bold">{onlineCount}</span></div>
            <div>Logi: <span className="text-[var(--terminal-green)] font-bold">{logs.length}/100</span></div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="text-[var(--terminal-gray)] text-xs">
                Oczekiwanie...
              </div>
            ) : (
              logs.slice(0, 20).map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => handleLogClick(log.id)}
                    className={`border border-l-4 rounded px-2 py-1 text-xs font-mono cursor-pointer transition-all ${
                      COLOR_MAP[log.color]
                    } ${isExpanded ? 'ring-2 ring-[var(--terminal-green)]' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold break-words ${TEXT_COLOR_MAP[log.color]}`}>
                          {log.title}
                        </div>
                        {log.data !== undefined && log.data !== null && (
                          <div className={`text-[var(--terminal-gray)] text-xs mt-1 break-words whitespace-pre-wrap ${
                            isExpanded ? 'max-h-none overflow-visible' : 'max-h-12 overflow-hidden'
                          }`}>
                            {isExpanded 
                              ? formatData(log.data)
                              : formatData(log.data).substring(0, 100) + (formatData(log.data).length > 100 ? '...' : '')
                            }
                          </div>
                        )}
                      </div>
                      <div className="text-[var(--terminal-gray)] text-xs whitespace-nowrap flex-shrink-0">
                        {formatTime(log.timestamp)}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 text-[var(--terminal-gray)] text-xs italic">
                        Kliknij aby zwinąć
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
