'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameOverProps {
  score: number;
  lines: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  lines,
  level,
  highScore,
  isNewHighScore,
  onRestart,
}) => {
  const { themeId } = useTheme();

  // Get theme-specific modal styles
  const getModalClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'bg-black/95 rounded-xl p-6 sm:p-8 max-w-sm w-full border border-cyan-500/50 shadow-2xl animate-fade-in';
      case 'brutalist':
        return 'bg-neutral-800 p-6 sm:p-8 max-w-sm w-full border-4 border-black shadow-2xl animate-fade-in';
      case 'organic-flow':
        return 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-white/30 shadow-2xl animate-fade-in';
      default:
        return 'bg-gray-900 rounded-xl p-6 sm:p-8 max-w-sm w-full border border-gray-700 shadow-2xl animate-fade-in';
    }
  };

  // Get theme-specific overlay styles
  const getOverlayClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'bg-purple-900/80';
      case 'brutalist':
        return 'bg-black/90';
      case 'organic-flow':
        return 'bg-black/50 backdrop-blur-sm';
      default:
        return 'bg-black/80';
    }
  };

  // Get theme-specific title styles
  const getTitleClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'text-3xl sm:text-4xl font-bold text-center text-pink-500 mb-6 neon-tokyo-title';
      case 'brutalist':
        return 'text-3xl sm:text-4xl font-black text-center text-red-500 mb-6 brutalist-title';
      case 'organic-flow':
        return 'text-3xl sm:text-4xl font-bold text-center text-white mb-6 organic-title';
      default:
        return 'text-3xl sm:text-4xl font-bold text-center text-red-500 mb-6';
    }
  };

  // Get theme-specific high score badge styles
  const getHighScoreBadgeClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'text-yellow-300 font-bold text-lg';
      case 'brutalist':
        return 'text-red-500 font-black text-lg uppercase';
      case 'organic-flow':
        return 'text-yellow-200 font-bold text-lg';
      default:
        return 'text-yellow-400 font-bold text-lg';
    }
  };

  // Get theme-specific label styles
  const getLabelClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'text-cyan-400/80';
      case 'brutalist':
        return 'text-white/70 uppercase';
      case 'organic-flow':
        return 'text-white/70';
      default:
        return 'text-gray-400';
    }
  };

  // Get theme-specific value styles
  const getValueClass = (variant: 'score' | 'lines' | 'level' | 'highScore') => {
    switch (themeId) {
      case 'neon-tokyo':
        switch (variant) {
          case 'score':
            return 'text-white font-bold font-mono text-xl';
          case 'lines':
            return 'text-green-400 font-bold font-mono';
          case 'level':
            return 'text-cyan-400 font-bold font-mono';
          case 'highScore':
            return 'text-yellow-300 font-bold font-mono';
        }
        break;
      case 'brutalist':
        switch (variant) {
          case 'score':
            return 'text-white font-black font-mono text-xl';
          case 'lines':
            return 'text-white font-black font-mono';
          case 'level':
            return 'text-white font-black font-mono';
          case 'highScore':
            return 'text-red-500 font-black font-mono';
        }
        break;
      case 'organic-flow':
        switch (variant) {
          case 'score':
            return 'text-white font-bold font-mono text-xl';
          case 'lines':
            return 'text-green-200 font-bold font-mono';
          case 'level':
            return 'text-blue-200 font-bold font-mono';
          case 'highScore':
            return 'text-yellow-200 font-bold font-mono';
        }
        break;
      default:
        switch (variant) {
          case 'score':
            return 'text-white font-bold font-mono text-xl';
          case 'lines':
            return 'text-green-400 font-bold font-mono';
          case 'level':
            return 'text-cyan-400 font-bold font-mono';
          case 'highScore':
            return 'text-yellow-400 font-bold font-mono';
        }
    }
  };

  // Get theme-specific button styles
  const getButtonClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return `
          w-full py-3 px-6
          bg-gradient-to-r from-cyan-600 to-pink-600
          hover:from-cyan-500 hover:to-pink-500
          text-white font-bold text-lg
          rounded-lg
          border border-cyan-400
          transition-all duration-200
          transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl
        `;
      case 'brutalist':
        return `
          w-full py-3 px-6
          bg-white text-black
          hover:bg-gray-200
          font-black text-lg uppercase
          border-4 border-black
          transition-all duration-200
          transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl
        `;
      case 'organic-flow':
        return `
          w-full py-3 px-6
          bg-white/30 backdrop-blur-sm
          hover:bg-white/40
          text-white font-bold text-lg
          rounded-xl
          border border-white/40
          transition-all duration-200
          transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl
        `;
      default:
        return `
          w-full py-3 px-6
          bg-gradient-to-r from-purple-600 to-blue-600
          hover:from-purple-500 hover:to-blue-500
          text-white font-bold text-lg
          rounded-lg
          transition-all duration-200
          transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl
        `;
    }
  };

  // Get theme-specific divider styles
  const getDividerClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'border-t border-cyan-500/30 pt-3';
      case 'brutalist':
        return 'border-t-4 border-black pt-3';
      case 'organic-flow':
        return 'border-t border-white/20 pt-3';
      default:
        return 'border-t border-gray-700 pt-3';
    }
  };

  const formatText = (text: string) => {
    return themeId === 'brutalist' ? text.toUpperCase() : text;
  };

  return (
    <div className={`fixed inset-0 ${getOverlayClass()} flex items-center justify-center z-50 p-4`}>
      <div className={getModalClass()}>
        <h2 className={getTitleClass()}>
          {formatText('Game Over')}
        </h2>

        {isNewHighScore && (
          <div className="text-center mb-4 animate-pulse">
            <span className={getHighScoreBadgeClass()}>
              {formatText('New High Score!')}
            </span>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className={getLabelClass()}>{formatText('Score')}</span>
            <span className={getValueClass('score')}>
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={getLabelClass()}>{formatText('Lines')}</span>
            <span className={getValueClass('lines')}>
              {lines}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={getLabelClass()}>{formatText('Level')}</span>
            <span className={getValueClass('level')}>
              {level}
            </span>
          </div>
          <div className={getDividerClass()}>
            <div className="flex justify-between items-center">
              <span className={themeId === 'neon-tokyo' ? 'text-yellow-400' : themeId === 'brutalist' ? 'text-red-500 uppercase' : themeId === 'organic-flow' ? 'text-yellow-200' : 'text-yellow-500'}>
                {formatText('High Score')}
              </span>
              <span className={getValueClass('highScore')}>
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className={getButtonClass()}
        >
          {formatText('Play Again')}
        </button>

        <p className={`text-center text-sm mt-4 ${themeId === 'organic-flow' ? 'text-white/50' : 'text-gray-500'}`}>
          Press Enter to restart
        </p>
      </div>
    </div>
  );
};
