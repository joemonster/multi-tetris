'use client';

import React from 'react';

interface ScorePanelProps {
  score: number;
  lines: number;
  level: number;
  highScore: number;
}

export const ScorePanel: React.FC<ScorePanelProps> = React.memo(
  ({ score, lines, level, highScore }) => {
    return (
      <div className="space-y-3">
        {/* High Score */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-yellow-500 mb-1 uppercase tracking-wider">
            High Score
          </h3>
          <p className="text-xl font-bold text-yellow-400 font-mono">
            {highScore.toLocaleString()}
          </p>
        </div>

        {/* Current Score */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Score
          </h3>
          <p className="text-2xl font-bold text-white font-mono">
            {score.toLocaleString()}
          </p>
        </div>

        {/* Level */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Level
          </h3>
          <p className="text-xl font-bold text-cyan-400 font-mono">{level}</p>
        </div>

        {/* Lines */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Lines
          </h3>
          <p className="text-xl font-bold text-green-400 font-mono">{lines}</p>
        </div>
      </div>
    );
  }
);

ScorePanel.displayName = 'ScorePanel';
