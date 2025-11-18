'use client';

import React from 'react';

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
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 sm:p-8 max-w-sm w-full border border-gray-700 shadow-2xl animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-red-500 mb-6">
          GAME OVER
        </h2>

        {isNewHighScore && (
          <div className="text-center mb-4 animate-pulse">
            <span className="text-yellow-400 font-bold text-lg">
              NEW HIGH SCORE!
            </span>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Score</span>
            <span className="text-white font-bold font-mono text-xl">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Lines</span>
            <span className="text-green-400 font-bold font-mono">
              {lines}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Level</span>
            <span className="text-cyan-400 font-bold font-mono">
              {level}
            </span>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-500">High Score</span>
              <span className="text-yellow-400 font-bold font-mono">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="
            w-full py-3 px-6
            bg-gradient-to-r from-purple-600 to-blue-600
            hover:from-purple-500 hover:to-blue-500
            text-white font-bold text-lg
            rounded-lg
            transition-all duration-200
            transform hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl
          "
        >
          Play Again
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Press Enter to restart
        </p>
      </div>
    </div>
  );
};
