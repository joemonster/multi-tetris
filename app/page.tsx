'use client';

import React from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { GameBoard } from './components/GameBoard';
import { NextPiece } from './components/NextPiece';
import { ScorePanel } from './components/ScorePanel';
import { Controls } from './components/Controls';
import { GameOver } from './components/GameOver';

export default function TetrisGame() {
  const { gameState, actions } = useGameLogic();

  // Setup keyboard controls
  useKeyboardControls({
    actions,
    isPlaying: gameState.isPlaying,
    gameOver: gameState.gameOver,
  });

  const isNewHighScore = gameState.gameOver && gameState.score === gameState.highScore && gameState.score > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-6">
        TETRIS
      </h1>

      {/* Main game area */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
        {/* Game board */}
        <div className="relative">
          <GameBoard
            board={gameState.board}
            currentPiece={gameState.currentPiece}
            isPaused={gameState.isPaused}
          />

          {/* Start screen overlay */}
          {!gameState.isPlaying && !gameState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center p-4">
                <p className="text-xl font-bold text-white mb-4">
                  Press Start to Play
                </p>
                <button
                  onClick={actions.startGame}
                  className="
                    py-3 px-8
                    bg-gradient-to-r from-green-600 to-emerald-600
                    hover:from-green-500 hover:to-emerald-500
                    text-white font-bold text-lg
                    rounded-lg
                    transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    shadow-lg
                  "
                >
                  Start Game
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  or press Enter
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-row md:flex-col gap-4 md:gap-0 md:space-y-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <NextPiece pieceType={gameState.nextPiece} />
          </div>
          <div className="flex-1 md:flex-none">
            <ScorePanel
              score={gameState.score}
              lines={gameState.lines}
              level={gameState.level}
              highScore={gameState.highScore}
            />
          </div>
        </div>
      </div>

      {/* Game buttons for desktop */}
      <div className="hidden md:flex gap-3 mt-6">
        {!gameState.isPlaying ? (
          <button
            onClick={actions.startGame}
            className="
              py-2 px-6
              bg-green-600 hover:bg-green-500
              text-white font-semibold
              rounded-lg
              transition-colors duration-200
            "
          >
            Start
          </button>
        ) : (
          <button
            onClick={actions.togglePause}
            className="
              py-2 px-6
              bg-yellow-600 hover:bg-yellow-500
              text-white font-semibold
              rounded-lg
              transition-colors duration-200
            "
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button
          onClick={actions.resetGame}
          className="
            py-2 px-6
            bg-red-600 hover:bg-red-500
            text-white font-semibold
            rounded-lg
            transition-colors duration-200
          "
        >
          Reset
        </button>
      </div>

      {/* Mobile controls */}
      <Controls
        onMoveLeft={actions.moveLeft}
        onMoveRight={actions.moveRight}
        onMoveDown={actions.moveDown}
        onRotate={actions.rotate}
        onHardDrop={actions.hardDrop}
        onPause={actions.togglePause}
        isPlaying={gameState.isPlaying}
        isPaused={gameState.isPaused}
      />

      {/* Controls help */}
      <div className="hidden md:block mt-6 text-gray-500 text-sm text-center">
        <p>
          <span className="text-gray-400">Controls:</span>{' '}
          <span className="text-gray-300">←→</span> Move |{' '}
          <span className="text-gray-300">↑</span> Rotate |{' '}
          <span className="text-gray-300">↓</span> Soft Drop |{' '}
          <span className="text-gray-300">Space</span> Hard Drop |{' '}
          <span className="text-gray-300">P</span> Pause
        </p>
      </div>

      {/* Game Over modal */}
      {gameState.gameOver && (
        <GameOver
          score={gameState.score}
          lines={gameState.lines}
          level={gameState.level}
          highScore={gameState.highScore}
          isNewHighScore={isNewHighScore}
          onRestart={actions.startGame}
        />
      )}
    </div>
  );
}
