'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { GameBoard } from '../../components/GameBoard';
import { NextPiece } from '../../components/NextPiece';
import { ScorePanel } from '../../components/ScorePanel';
import { Controls } from '../../components/Controls';
import { GameOver } from '../../components/GameOver';
import { ThemeSelector } from '../../components/ThemeSelector';
import { useTheme, ThemeId } from '../../contexts/ThemeContext';

export default function SoloGame() {
  const router = useRouter();
  const { gameState, actions } = useGameLogic();
  const { themeId, setTheme } = useTheme();

  // Setup keyboard controls
  useKeyboardControls({
    actions,
    isPlaying: gameState.isPlaying,
    gameOver: gameState.gameOver,
  });

  // Theme keyboard shortcuts (1, 2, 3) and ESC to go back
  useEffect(() => {
    const handleThemeKeypress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // ESC key - go back to lobby
      if (e.key === 'Escape') {
        router.push('/');
        return;
      }

      const themeMap: Record<string, ThemeId> = {
        '1': 'neon-tokyo',
        '2': 'brutalist',
        '3': 'organic-flow',
      };

      if (themeMap[e.key]) {
        setTheme(themeMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleThemeKeypress);
    return () => window.removeEventListener('keydown', handleThemeKeypress);
  }, [setTheme, router]);

  const isNewHighScore = gameState.gameOver && gameState.score === gameState.highScore && gameState.score > 0;

  const getBackgroundClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black';
      case 'brutalist':
        return 'min-h-screen bg-neutral-900';
      case 'organic-flow':
        return 'min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500';
      default:
        return 'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900';
    }
  };

  const getTitleClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 neon-tokyo-title';
      case 'brutalist':
        return 'text-4xl sm:text-5xl font-black text-white brutalist-title';
      case 'organic-flow':
        return 'text-4xl sm:text-5xl font-bold text-white organic-title';
      default:
        return 'text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500';
    }
  };

  const getButtonClass = (variant: 'start' | 'pause' | 'reset') => {
    const baseClass = 'py-2 px-6 font-semibold rounded-lg transition-colors duration-200';

    switch (themeId) {
      case 'neon-tokyo':
        switch (variant) {
          case 'start':
            return `${baseClass} bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400`;
          case 'pause':
            return `${baseClass} bg-purple-600 hover:bg-purple-500 text-white border border-purple-400`;
          case 'reset':
            return `${baseClass} bg-pink-600 hover:bg-pink-500 text-white border border-pink-400`;
        }
        break;
      case 'brutalist':
        switch (variant) {
          case 'start':
            return `${baseClass} bg-white text-black border-4 border-black hover:bg-gray-200 font-bold uppercase`;
          case 'pause':
            return `${baseClass} bg-gray-400 text-black border-4 border-black hover:bg-gray-300 font-bold uppercase`;
          case 'reset':
            return `${baseClass} bg-red-500 text-white border-4 border-black hover:bg-red-400 font-bold uppercase`;
        }
        break;
      case 'organic-flow':
        switch (variant) {
          case 'start':
            return `${baseClass} bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-xl`;
          case 'pause':
            return `${baseClass} bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-xl`;
          case 'reset':
            return `${baseClass} bg-pink-500/50 backdrop-blur-sm hover:bg-pink-500/70 text-white border border-pink-400/50 rounded-xl`;
        }
        break;
      default:
        switch (variant) {
          case 'start':
            return `${baseClass} bg-green-600 hover:bg-green-500 text-white`;
          case 'pause':
            return `${baseClass} bg-yellow-600 hover:bg-yellow-500 text-white`;
          case 'reset':
            return `${baseClass} bg-red-600 hover:bg-red-500 text-white`;
        }
    }
  };

  const getOverlayClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'bg-black/80 rounded-lg border border-cyan-500/30';
      case 'brutalist':
        return 'bg-black/90 border-4 border-black';
      case 'organic-flow':
        return 'bg-white/20 backdrop-blur-md rounded-xl border border-white/30';
      default:
        return 'bg-black/80 rounded-lg';
    }
  };

  const getTitleText = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'TETRIS';
      case 'brutalist':
        return 'TETRIS';
      case 'organic-flow':
        return 'Tetris';
      default:
        return 'TETRIS';
    }
  };

  const getHelpTextClass = () => {
    switch (themeId) {
      case 'neon-tokyo':
        return 'text-cyan-400/60';
      case 'brutalist':
        return 'text-gray-500';
      case 'organic-flow':
        return 'text-white/60';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${getBackgroundClass()} flex flex-col items-center justify-center p-4`}>
      {/* Header with back button, title, and theme selector */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        {/* Back to lobby button */}
        <button
          onClick={() => router.push('/')}
          className={`
            theme-preview p-3 hover:scale-105 transition-all cursor-pointer
            ${themeId === 'neon-tokyo' ? 'theme-preview-neon' : ''}
            ${themeId === 'brutalist' ? 'theme-preview-brutal' : ''}
            ${themeId === 'organic-flow' ? 'theme-preview-organic' : ''}
          `}
          aria-label="Back to lobby"
          title="Back to lobby (Esc)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Title */}
        <h1 className={`${getTitleClass()}`}>
          {getTitleText()}
        </h1>

        {/* Theme selector */}
        <div>
          <ThemeSelector />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
        <div className="relative">
          <GameBoard
            board={gameState.board}
            currentPiece={gameState.currentPiece}
            isPaused={gameState.isPaused}
          />

          {!gameState.isPlaying && !gameState.gameOver && (
            <div className={`absolute inset-0 flex items-center justify-center ${getOverlayClass()}`}>
              <div className="text-center p-4">
                <p className={`text-xl font-bold mb-4 ${themeId === 'organic-flow' ? 'text-white' : 'text-white'}`}>
                  {themeId === 'brutalist' ? 'PRESS START TO PLAY' : 'Press Start to Play'}
                </p>
                <button
                  onClick={actions.startGame}
                  className={`
                    py-3 px-8
                    ${themeId === 'neon-tokyo'
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border border-cyan-400'
                      : themeId === 'brutalist'
                      ? 'bg-white text-black border-4 border-black hover:bg-gray-200 font-black uppercase'
                      : themeId === 'organic-flow'
                      ? 'bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'}
                    text-white font-bold text-lg
                    rounded-lg
                    transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    shadow-lg
                  `}
                >
                  {themeId === 'brutalist' ? 'START GAME' : 'Start Game'}
                </button>
                <p className={`text-sm mt-4 ${themeId === 'organic-flow' ? 'text-white/60' : 'text-gray-400'}`}>
                  or press Enter
                </p>
              </div>
            </div>
          )}
        </div>

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

      <div className="hidden md:flex gap-3 mt-6">
        {!gameState.isPlaying ? (
          <button
            onClick={actions.startGame}
            className={getButtonClass('start')}
          >
            {themeId === 'brutalist' ? 'START' : 'Start'}
          </button>
        ) : (
          <button
            onClick={actions.togglePause}
            className={getButtonClass('pause')}
          >
            {themeId === 'brutalist'
              ? (gameState.isPaused ? 'RESUME' : 'PAUSE')
              : (gameState.isPaused ? 'Resume' : 'Pause')}
          </button>
        )}
        <button
          onClick={actions.resetGame}
          className={getButtonClass('reset')}
        >
          {themeId === 'brutalist' ? 'RESET' : 'Reset'}
        </button>
      </div>

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

      <div className={`hidden md:block mt-6 text-sm text-center ${getHelpTextClass()}`}>
        <p>
          <span className={themeId === 'organic-flow' ? 'text-white/70' : 'text-gray-400'}>Controls:</span>{' '}
          <span className={themeId === 'organic-flow' ? 'text-white/90' : 'text-gray-300'}>Arrows</span> Move |{' '}
          <span className={themeId === 'organic-flow' ? 'text-white/90' : 'text-gray-300'}>Up</span> Rotate |{' '}
          <span className={themeId === 'organic-flow' ? 'text-white/90' : 'text-gray-300'}>Space</span> Hard Drop |{' '}
          <span className={themeId === 'organic-flow' ? 'text-white/90' : 'text-gray-300'}>P</span> Pause |{' '}
          <span className={themeId === 'organic-flow' ? 'text-white/90' : 'text-gray-300'}>ESC</span> Menu |{' '}
          <span className={themeId === 'organic-flow' ? 'text-white/90' : 'text-gray-300'}>1-3</span> Theme
        </p>
      </div>

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
