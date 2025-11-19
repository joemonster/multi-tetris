'use client';

import React, { useState, useEffect } from 'react';

interface NicknameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NicknameInput({ value, onChange }: NicknameInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tetris_nickname');
    if (saved) {
      onChange(saved);
    }
  }, [onChange]);

  // Save to localStorage on change
  useEffect(() => {
    if (value) {
      localStorage.setItem('tetris_nickname', value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, 15);
    // Allow alphanumeric and Polish characters
    const sanitized = newValue.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_]/g, '');
    onChange(sanitized);
  };

  return (
    <div className="w-full max-w-md">
      <div className="terminal-panel p-4">
        <label className="block text-[var(--terminal-green)] text-sm mb-2 font-mono">
          {'> NICK:'}
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="GRACZ_XXXX"
            className="terminal-input w-full"
            maxLength={15}
            minLength={3}
          />
          {isFocused && !value && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--terminal-green)] animate-pulse">
              ▋
            </span>
          )}
        </div>
        <p className="text-[var(--terminal-gray)] text-xs mt-2 font-mono">
          3-15 znaków, alfanumeryczne
        </p>
      </div>
    </div>
  );
}
