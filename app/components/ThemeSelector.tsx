'use client';

import React from 'react';
import { useTheme, ThemeId } from '../contexts/ThemeContext';

interface ThemeOption {
  id: ThemeId;
  name: string;
  shortcut: string;
  previewClass: string;
  colors: string[];
}

const themeOptions: ThemeOption[] = [
  {
    id: 'neon-tokyo',
    name: 'NEON TOKYO',
    shortcut: '1',
    previewClass: 'theme-preview-neon',
    colors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'],
  },
  {
    id: 'brutalist',
    name: 'BRUTALIST',
    shortcut: '2',
    previewClass: 'theme-preview-brutal',
    colors: ['#f0f0f0', '#b0b0b0', '#707070', '#ff3333'],
  },
  {
    id: 'organic-flow',
    name: 'ORGANIC FLOW',
    shortcut: '3',
    previewClass: 'theme-preview-organic',
    colors: ['#fa709a', '#30cfd0', '#a8edea', '#a1c4fd'],
  },
];

export const ThemeSelector: React.FC = () => {
  const { themeId, setTheme, isTransitioning } = useTheme();

  return (
    <div className="theme-selector">
      {themeOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => setTheme(option.id)}
          disabled={isTransitioning}
          className={`
            theme-preview ${option.previewClass}
            ${themeId === option.id ? 'active' : ''}
            ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={`${option.name} theme`}
          aria-pressed={themeId === option.id}
          title={`${option.name} (${option.shortcut})`}
        >
          <div className="preview-blocks">
            {option.colors.map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs whitespace-nowrap">
            {option.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
