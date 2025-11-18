'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeId = 'neon-tokyo' | 'brutalist' | 'organic-flow';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  blockI: string;
  blockO: string;
  blockT: string;
  blockS: string;
  blockZ: string;
  blockJ: string;
  blockL: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

export interface ThemeEffects {
  glowIntensity: string;
  blockShadow: string;
  textShadow: string;
  borderRadius: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  displayName: string;
  colors: ThemeColors;
  effects: ThemeEffects;
}

export const themes: Record<ThemeId, Theme> = {
  'neon-tokyo': {
    id: 'neon-tokyo',
    name: 'neon-tokyo',
    displayName: 'NEON TOKYO',
    colors: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#1a0033',
      blockI: '#00ffff',
      blockO: '#ffff00',
      blockT: '#ff00ff',
      blockS: '#00ff00',
      blockZ: '#ff0000',
      blockJ: '#0088ff',
      blockL: '#ff8800',
      textPrimary: '#ffffff',
      textSecondary: '#00ffff',
      accent: '#ff00ff',
    },
    effects: {
      glowIntensity: '0 0 20px',
      blockShadow: '0 0 20px currentColor',
      textShadow: '0 0 10px currentColor',
      borderRadius: '2px',
    },
  },
  'brutalist': {
    id: 'brutalist',
    name: 'brutalist',
    displayName: 'BRUTALIST',
    colors: {
      bgPrimary: '#1a1a1a',
      bgSecondary: '#2d2d2d',
      blockI: '#f0f0f0',
      blockO: '#d0d0d0',
      blockT: '#b0b0b0',
      blockS: '#909090',
      blockZ: '#707070',
      blockJ: '#505050',
      blockL: '#ff3333',
      textPrimary: '#ffffff',
      textSecondary: '#909090',
      accent: '#ff3333',
    },
    effects: {
      glowIntensity: 'none',
      blockShadow: '4px 4px 0px rgba(0,0,0,0.8)',
      textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
      borderRadius: '0px',
    },
  },
  'organic-flow': {
    id: 'organic-flow',
    name: 'organic-flow',
    displayName: 'ORGANIC FLOW',
    colors: {
      bgPrimary: '#667eea',
      bgSecondary: '#764ba2',
      blockI: '#fa709a',
      blockO: '#30cfd0',
      blockT: '#a8edea',
      blockS: '#ff9a9e',
      blockZ: '#fecfef',
      blockJ: '#a1c4fd',
      blockL: '#e2ebf0',
      textPrimary: '#ffffff',
      textSecondary: '#e2ebf0',
      accent: '#fa709a',
    },
    effects: {
      glowIntensity: '0 8px 32px rgba(31, 38, 135, 0.37)',
      blockShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  isTransitioning: boolean;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'tetris-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>('neon-tokyo');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (savedTheme && themes[savedTheme]) {
      setThemeId(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);

    // Announce theme change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Theme changed to ${themes[themeId].displayName}`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    if (id === themeId) return;

    setIsTransitioning(true);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, id);

    // Apply transition effect
    setTimeout(() => {
      setThemeId(id);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 400);
  }, [themeId]);

  const cycleTheme = useCallback(() => {
    const themeIds: ThemeId[] = ['neon-tokyo', 'brutalist', 'organic-flow'];
    const currentIndex = themeIds.indexOf(themeId);
    const nextIndex = (currentIndex + 1) % themeIds.length;
    setTheme(themeIds[nextIndex]);
  }, [themeId, setTheme]);

  const value: ThemeContextType = {
    theme: themes[themeId],
    themeId,
    setTheme,
    isTransitioning,
    cycleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={isTransitioning ? 'theme-transition' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper to get block color based on piece type and theme
export const getThemedBlockColor = (pieceType: string, themeId: ThemeId): string => {
  const theme = themes[themeId];
  const colorMap: Record<string, string> = {
    'I': theme.colors.blockI,
    'O': theme.colors.blockO,
    'T': theme.colors.blockT,
    'S': theme.colors.blockS,
    'Z': theme.colors.blockZ,
    'J': theme.colors.blockJ,
    'L': theme.colors.blockL,
  };
  return colorMap[pieceType] || theme.colors.blockI;
};
