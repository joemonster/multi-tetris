'use client';

import React, { useState, useEffect } from 'react';

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nickname: string) => void;
}

export function NicknameModal({ isOpen, onClose, onConfirm }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Load from sessionStorage (priority) or localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const sessionSaved = sessionStorage.getItem('tetris_nickname');
      if (sessionSaved) {
        setNickname(sessionSaved);
        return;
      }
      
      const localSaved = localStorage.getItem('tetris_nickname');
      if (localSaved) {
        setNickname(localSaved);
      }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, 15);
    // Allow alphanumeric and Polish characters
    const sanitized = newValue.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_]/g, '');
    setNickname(sanitized);
  };

  const handleConfirm = () => {
    let finalNickname = nickname;

    // If nickname is empty or too short, generate random one
    if (!finalNickname || finalNickname.length < 3) {
      finalNickname = `GRACZ_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }

    // Save to localStorage (user preference) and sessionStorage (current session)
    localStorage.setItem('tetris_nickname', finalNickname);
    sessionStorage.setItem('tetris_nickname', finalNickname);

    onConfirm(finalNickname);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="terminal-panel p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-[var(--terminal-green)] text-xl font-mono font-bold mb-2">
              {'> MULTIPLAYER'}
            </h2>
            <p className="text-[var(--terminal-gray)] text-sm font-mono">
              Podaj swój nick, aby dołączyć do gry online
            </p>
          </div>

          {/* Nickname Input */}
          <div className="mb-6">
            <label className="block text-[var(--terminal-green)] text-sm mb-2 font-mono">
              {'> NICK:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="GRACZ_XXXX"
                className="terminal-input w-full"
                maxLength={15}
                autoFocus
              />
              {isFocused && !nickname && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--terminal-green)] animate-pulse">
                  ▋
                </span>
              )}
            </div>
            <p className="text-[var(--terminal-gray)] text-xs mt-2 font-mono">
              3-15 znaków, alfanumeryczne
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="terminal-btn flex-1 text-sm font-mono cursor-pointer"
            >
              [DOŁĄCZ DO GRY]
            </button>
            <button
              onClick={onClose}
              className="terminal-btn-secondary text-sm font-mono px-4 cursor-pointer"
            >
              [ANULUJ]
            </button>
          </div>

          {/* Hint */}
          <div className="mt-4 text-[var(--terminal-gray)] text-xs font-mono text-center">
            <p>Enter = Potwierdź | Esc = Anuluj</p>
          </div>
        </div>
      </div>
    </div>
  );
}
