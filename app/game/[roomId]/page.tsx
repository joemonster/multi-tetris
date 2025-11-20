'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMultiplayerGame } from '../../hooks/multiplayer/useMultiplayerGame';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { GameBoard } from '../../components/GameBoard';
import { NextPiece } from '../../components/NextPiece';
import { Controls } from '../../components/Controls';
import { OpponentBoard } from '../../components/multiplayer/OpponentBoard';
import { PlayerCard } from '../../components/multiplayer/PlayerCard';
import { GameTimer } from '../../components/multiplayer/GameTimer';
import { GameDebugPanel } from '../../components/debug/GameDebugPanel';
import { GameEndModal } from '../../components/multiplayer/GameEndModal';

export default function MultiplayerGame() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [nickname, setNickname] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [disconnectCountdown, setDisconnectCountdown] = useState(10);

  // Load nickname
  useEffect(() => {
    const saved = localStorage.getItem('tetris_nickname');
    if (saved) {
      setNickname(saved);
    } else {
      const randomNick = `GRACZ_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setNickname(randomNick);
    }
  }, []);

  const {
    gameState,
    actions,
    opponentState,
    opponentNickname,
    isOpponentDisconnected,
    gameResult,
    isConnected,
    isPlayerLeading,
    isOpponentLeading,
    leaderNickname,
    gameStartTime,
    emit,
    gameEndData,
    rematchRequest,
    rematchTimeout,
  } = useMultiplayerGame({ roomId, nickname });

  // Setup keyboard controls
  useKeyboardControls({
    actions,
    isPlaying: gameState.isPlaying,
    gameOver: gameState.gameOver,
  });

  // Handle exit game confirmation
  const handleExitGame = () => {
    router.push('/');
  };

  // Handle rematch request
  const handleRematchRequest = () => {
    emit('rematch_request', { roomId });
  };

  // Handle rematch accept
  const handleRematchAccept = () => {
    emit('rematch_accept', { roomId });
  };

  // Handle rematch reject
  const handleRematchReject = () => {
    emit('rematch_reject', { roomId });
  };

  // Handle return to lobby
  const handleReturnToLobby = () => {
    emit('leave_game', { roomId });
    router.push('/');
  };

  // Handle disconnect countdown
  useEffect(() => {
    if (isOpponentDisconnected && disconnectCountdown > 0) {
      const timer = setTimeout(() => {
        setDisconnectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isOpponentDisconnected && disconnectCountdown === 0) {
      router.push('/');
    }
  }, [isOpponentDisconnected, disconnectCountdown, router]);

  // Create empty board for opponent if no state yet
  const emptyBoard = Array(20).fill(null).map(() =>
    Array(10).fill({ filled: false, color: '' })
  );

  return (
    <div className="min-h-screen bg-[var(--bg-terminal)] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="terminal-panel p-3 mb-4 w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <span className="text-[var(--terminal-green)] font-mono text-sm">
            TETRIS BATTLE
          </span>
          <span className="text-[var(--terminal-gray)] font-mono text-xs">
            ROOM: {roomId}
          </span>
        </div>
      </div>

      {/* Game area */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center lg:items-start">
        {/* Opponent side */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[var(--terminal-gray)] font-mono text-sm">
            PRZECIWNIK
          </div>
          <OpponentBoard
            board={opponentState?.board || emptyBoard}
            nickname={opponentNickname || 'Oczekiwanie...'}
            score={opponentState?.score || 0}
            lines={opponentState?.lines || 0}
            isLeading={isOpponentLeading}
          />
        </div>

        {/* Center - Timer and Leader */}
        <div className="flex flex-col items-center gap-4">
          <GameTimer
            isRunning={gameState.isPlaying && !gameState.gameOver}
            startTime={gameStartTime}
            maxDuration={Number(process.env.NEXT_PUBLIC_GAME_DURATION_MS) || 300000}
            onTimeUp={() => {
              // Send game_over event when time is up
              emit('game_over', { roomId, reason: 'time_limit' });
            }}
          />

          {leaderNickname && (
            <div className="terminal-panel p-2 text-center">
              <span className="text-[var(--terminal-gray)] font-mono text-xs">
                WYGRYWA:
              </span>
              <div className="text-[var(--terminal-green)] font-mono text-sm font-bold text-glow">
                {leaderNickname}
              </div>
            </div>
          )}

          {/* Next piece */}
          <div className="hidden lg:block">
            <NextPiece pieceType={gameState.nextPiece} />
          </div>
        </div>

        {/* Player side */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[var(--terminal-green)] font-mono text-sm text-glow">
            TY
          </div>

          <div className="relative">
            <GameBoard
              board={gameState.board}
              currentPiece={gameState.currentPiece}
              isPaused={gameState.isPaused}
            />
          </div>

          {/* Player stats */}
          <PlayerCard
            nickname={nickname}
            score={gameState.score}
            lines={gameState.lines}
            isCurrentPlayer={true}
            isLeading={isPlayerLeading}
          />

          {/* Next piece for mobile */}
          <div className="lg:hidden">
            <NextPiece pieceType={gameState.nextPiece} />
          </div>
        </div>
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

      {/* Controls help and exit button */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => setShowExitModal(true)}
          className="terminal-button text-xs"
        >
          ZAKOŃCZ GRĘ
        </button>
        <span className="hidden md:inline text-[var(--terminal-gray)] text-xs font-mono">
          [ESC = MENU]
        </span>
      </div>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-[var(--bg-terminal)]/95 flex items-center justify-center z-50">
          <div className="terminal-panel p-6 text-center max-w-sm">
            <h2 className="text-[var(--terminal-orange)] text-xl font-mono font-bold mb-4">
              ! ZAKOŃCZYĆ GRĘ?
            </h2>
            <p className="text-[var(--terminal-gray)] font-mono text-sm mb-6">
              Na pewno chcesz wyjść? Przeciwnik wygra mecz.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowExitModal(false)}
                className="terminal-button"
              >
                WRÓĆ DO GRY
              </button>
              <button
                onClick={handleExitGame}
                className="terminal-button"
              >
                WYJDŹ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opponent disconnected modal */}
      {isOpponentDisconnected && (
        <div className="fixed inset-0 bg-[var(--bg-terminal)]/95 flex items-center justify-center z-50">
          <div className="terminal-panel p-6 text-center max-w-sm">
            <h2 className="text-[var(--terminal-orange)] text-xl font-mono font-bold mb-4">
              ! PRZECIWNIK SIĘ ROZŁĄCZYŁ
            </h2>
            <p className="text-[var(--terminal-gray)] font-mono text-sm mb-4">
              {opponentNickname || 'Przeciwnik'} opuścił grę.
            </p>
            <p className="text-[var(--terminal-gray)] font-mono text-sm mb-6">
              Powrót do menu za: <span className="text-[var(--terminal-green)] font-bold">{disconnectCountdown}</span> sekund
            </p>
            <button
              onClick={handleExitGame}
              className="terminal-button"
            >
              WYJDŹ TERAZ
            </button>
          </div>
        </div>
      )}

      {/* Game over modal */}
      {gameResult && (
        <div className="fixed inset-0 bg-[var(--bg-terminal)]/95 flex items-center justify-center z-50">
          <div className="terminal-panel p-8 text-center max-w-md">
            <h2 className="text-[var(--terminal-green)] text-2xl font-mono font-bold mb-4 text-glow">
              KONIEC GRY
            </h2>

            <div className="mb-6">
              <p className="text-[var(--terminal-gray)] font-mono text-sm mb-2">
                ZWYCIĘZCA:
              </p>
              <p className="text-[var(--terminal-green)] font-mono text-xl font-bold">
                {gameResult.winner}
              </p>
              <p className="text-[var(--terminal-gray)] font-mono text-xs mt-2">
                {gameResult.reason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-mono">
              <div className="terminal-panel p-3">
                <div className="text-[var(--terminal-gray)]">TY</div>
                <div className="text-[var(--terminal-green)]">{gameState.score}</div>
              </div>
              <div className="terminal-panel p-3">
                <div className="text-[var(--terminal-gray)]">PRZECIWNIK</div>
                <div className="text-[var(--terminal-green)]">{opponentState?.score || 0}</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/queue')}
                className="terminal-button"
              >
                KOLEJNA GRA
              </button>
              <button
                onClick={handleExitGame}
                className="terminal-button"
              >
                WYJDŹ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game End Modal - New Better Modal */}
      {gameEndData && (
        <GameEndModal
          winner={gameEndData.winner}
          reason={gameEndData.reason}
          playerNickname={nickname}
          playerScore={gameState.score}
          playerLines={gameState.lines}
          playerLevel={gameState.level}
          opponentScore={opponentState?.score || 0}
          opponentLines={opponentState?.lines || 0}
          opponentLevel={opponentState?.level || 0}
          onRematchRequest={handleRematchRequest}
          onReturnToLobby={handleReturnToLobby}
          rematchRequest={rematchRequest}
          rematchTimeout={rematchTimeout}
          onRematchAccept={handleRematchAccept}
          onRematchReject={handleRematchReject}
        />
      )}

      {/* Debug Panel */}
      <GameDebugPanel />
    </div>
  );
}
