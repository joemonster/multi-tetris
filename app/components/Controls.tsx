'use client';

import React from 'react';

interface ControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  isPlaying: boolean;
  isPaused: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onPause,
  isPlaying,
  isPaused,
}) => {
  const buttonClass = `
    bg-gray-700 hover:bg-gray-600 active:bg-gray-500
    text-white font-bold
    p-4 rounded-lg
    transition-colors duration-100
    select-none touch-manipulation
    disabled:opacity-50 disabled:cursor-not-allowed
    border border-gray-600
    shadow-lg active:shadow-inner
  `;

  const isDisabled = !isPlaying || isPaused;

  return (
    <div className="md:hidden mt-4 space-y-3">
      {/* Pause button */}
      <div className="flex justify-center">
        <button
          onClick={onPause}
          disabled={!isPlaying}
          className={`${buttonClass} px-8`}
          aria-label="Pause"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Control pad */}
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {/* Top row - Rotate */}
        <div />
        <button
          onClick={onRotate}
          disabled={isDisabled}
          className={buttonClass}
          aria-label="Rotate"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <div />

        {/* Middle row - Left and Right */}
        <button
          onClick={onMoveLeft}
          disabled={isDisabled}
          className={buttonClass}
          aria-label="Move Left"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={onHardDrop}
          disabled={isDisabled}
          className={`${buttonClass} bg-purple-700 hover:bg-purple-600 active:bg-purple-500 border-purple-600`}
          aria-label="Hard Drop"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
        <button
          onClick={onMoveRight}
          disabled={isDisabled}
          className={buttonClass}
          aria-label="Move Right"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Bottom row - Down */}
        <div />
        <button
          onClick={onMoveDown}
          disabled={isDisabled}
          className={buttonClass}
          aria-label="Soft Drop"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div />
      </div>
    </div>
  );
};
