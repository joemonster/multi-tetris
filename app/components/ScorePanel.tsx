'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ScorePanelProps {
  score: number;
  lines: number;
  level: number;
  highScore: number;
}

export const ScorePanel: React.FC<ScorePanelProps> = React.memo(
  ({ score, lines, level, highScore }) => {
    const { themeId } = useTheme();

    // Get theme-specific container styles
    const getContainerClass = () => {
      switch (themeId) {
        case 'neon-tokyo':
          return 'bg-black/60 rounded-lg p-4 border border-cyan-500/30';
        case 'brutalist':
          return 'bg-neutral-800 p-4 border-4 border-black brutalist-panel';
        case 'organic-flow':
          return 'organic-panel p-4';
        default:
          return 'bg-gray-800 rounded-lg p-4 border border-gray-700';
      }
    };

    // Get theme-specific label styles
    const getLabelClass = (variant: 'default' | 'highlight' = 'default') => {
      switch (themeId) {
        case 'neon-tokyo':
          return variant === 'highlight'
            ? 'text-sm font-semibold text-yellow-400 mb-1 uppercase tracking-wider'
            : 'text-sm font-semibold text-cyan-400/80 mb-1 uppercase tracking-wider';
        case 'brutalist':
          return 'text-sm font-bold text-white/70 mb-1 uppercase tracking-widest';
        case 'organic-flow':
          return variant === 'highlight'
            ? 'text-sm font-semibold text-yellow-200 mb-1 tracking-wider'
            : 'text-sm font-semibold text-white/70 mb-1 tracking-wider';
        default:
          return variant === 'highlight'
            ? 'text-sm font-semibold text-yellow-500 mb-1 uppercase tracking-wider'
            : 'text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider';
      }
    };

    // Get theme-specific value styles
    const getValueClass = (variant: 'score' | 'highlight' | 'level' | 'lines') => {
      switch (themeId) {
        case 'neon-tokyo':
          switch (variant) {
            case 'highlight':
              return 'text-xl font-bold text-yellow-300 font-mono';
            case 'score':
              return 'text-2xl font-bold text-white font-mono';
            case 'level':
              return 'text-xl font-bold text-cyan-400 font-mono';
            case 'lines':
              return 'text-xl font-bold text-green-400 font-mono';
          }
          break;
        case 'brutalist':
          switch (variant) {
            case 'highlight':
              return 'text-xl font-black text-red-500 font-mono';
            case 'score':
              return 'text-2xl font-black text-white font-mono';
            case 'level':
              return 'text-xl font-black text-white font-mono';
            case 'lines':
              return 'text-xl font-black text-white font-mono';
          }
          break;
        case 'organic-flow':
          switch (variant) {
            case 'highlight':
              return 'text-xl font-bold text-yellow-200 font-mono';
            case 'score':
              return 'text-2xl font-bold text-white font-mono';
            case 'level':
              return 'text-xl font-bold text-blue-200 font-mono';
            case 'lines':
              return 'text-xl font-bold text-green-200 font-mono';
          }
          break;
        default:
          switch (variant) {
            case 'highlight':
              return 'text-xl font-bold text-yellow-400 font-mono';
            case 'score':
              return 'text-2xl font-bold text-white font-mono';
            case 'level':
              return 'text-xl font-bold text-cyan-400 font-mono';
            case 'lines':
              return 'text-xl font-bold text-green-400 font-mono';
          }
      }
    };

    const formatLabel = (text: string) => {
      return themeId === 'brutalist' ? text.toUpperCase() : text;
    };

    return (
      <div className="space-y-3">
        {/* High Score */}
        <div className={getContainerClass()}>
          <h3 className={getLabelClass('highlight')}>
            {formatLabel('High Score')}
          </h3>
          <p className={getValueClass('highlight')}>
            {highScore.toLocaleString()}
          </p>
        </div>

        {/* Current Score */}
        <div className={getContainerClass()}>
          <h3 className={getLabelClass()}>
            {formatLabel('Score')}
          </h3>
          <p className={getValueClass('score')}>
            {score.toLocaleString()}
          </p>
        </div>

        {/* Level */}
        <div className={getContainerClass()}>
          <h3 className={getLabelClass()}>
            {formatLabel('Level')}
          </h3>
          <p className={getValueClass('level')}>{level}</p>
        </div>

        {/* Lines */}
        <div className={getContainerClass()}>
          <h3 className={getLabelClass()}>
            {formatLabel('Lines')}
          </h3>
          <p className={getValueClass('lines')}>{lines}</p>
        </div>
      </div>
    );
  }
);

ScorePanel.displayName = 'ScorePanel';
