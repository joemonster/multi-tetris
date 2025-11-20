'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLogic } from '../useGameLogic';
import { useSocket } from './useSocket';
import { OpponentState, GameUpdateData } from '../../lib/socket/client';
import { useDebug } from '../../contexts/DebugContext';

interface UseMultiplayerGameProps {
  roomId: string;
  nickname: string;
}

export function useMultiplayerGame({ roomId, nickname }: UseMultiplayerGameProps) {
  // Use existing game logic
  const gameLogic = useGameLogic();
  const { socket, isConnected, emit, on, off } = useSocket();
  const { addLog } = useDebug();

  // Multiplayer state
  const [opponentState, setOpponentState] = useState<OpponentState | null>(null);
  const [opponentNickname, setOpponentNickname] = useState<string>('');
  const [isOpponentDisconnected, setIsOpponentDisconnected] = useState(false);
  const [gameResult, setGameResult] = useState<{ winner: string; reason: string } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Load opponent nickname from localStorage on mount
  useEffect(() => {
    const savedOpponent = localStorage.getItem('tetris_opponent');
    if (savedOpponent) {
      setOpponentNickname(savedOpponent);
    }
  }, []);

  // Throttle ref for sending updates
  const lastUpdateRef = useRef<number>(0);
  const throttleMs = 100;

  // Auto-start game when component mounts (player navigated here from queue)
  useEffect(() => {
    if (isConnected && roomId && !gameStarted) {
      // Small delay to ensure everything is set up
      const timer = setTimeout(() => {
        gameLogic.actions.startGame();
        setGameStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, roomId, gameStarted, gameLogic.actions]);

  // Send game state to server (throttled)
  useEffect(() => {
    if (!isConnected || !roomId) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;
    lastUpdateRef.current = now;

    const updateData: GameUpdateData = {
      type: 'game_update',
      roomId,
      board: gameLogic.gameState.board,
      score: gameLogic.gameState.score,
      lines: gameLogic.gameState.lines,
      level: gameLogic.gameState.level,
      gameOver: gameLogic.gameState.gameOver,
    };

    emit('game_update', updateData);

    // If game over, notify server
    if (gameLogic.gameState.gameOver) {
      emit('game_over', { roomId });
    }
  }, [
    isConnected,
    roomId,
    gameLogic.gameState.board,
    gameLogic.gameState.score,
    gameLogic.gameState.lines,
    gameLogic.gameState.level,
    gameLogic.gameState.gameOver,
    emit,
  ]);

  // Listen for opponent updates
  useEffect(() => {
    if (!socket) return;

    const handleOpponentUpdate = (data: OpponentState) => {
      setOpponentState(data);
      addLog({
        type: 'event',
        title: 'Update od przeciwnika',
        data: { score: data.score, lines: data.lines },
        color: 'blue',
      });
    };

    const handleOpponentDisconnected = () => {
      setIsOpponentDisconnected(true);
      addLog({
        type: 'event',
        title: 'Przeciwnik rozłączony',
        color: 'orange',
      });
    };

    const handleOpponentReconnected = () => {
      setIsOpponentDisconnected(false);
      addLog({
        type: 'event',
        title: 'Przeciwnik ponownie połączony',
        color: 'green',
      });
    };

    const handleGameOver = (data: { winner: string; reason: string }) => {
      setGameResult(data);
      addLog({
        type: 'event',
        title: 'Koniec gry',
        data: { winner: data.winner, reason: data.reason },
        color: 'orange',
      });
    };

    const handleGameStart = (data: { roomId: string; opponent?: string }) => {
      if (data.opponent) {
        setOpponentNickname(data.opponent);
        addLog({
          type: 'event',
          title: `Gra rozpoczęta vs ${data.opponent}`,
          data: { roomId: data.roomId },
          color: 'green',
        });
      }
      // Game is auto-started, but this can serve as a backup
      if (!gameStarted) {
        gameLogic.actions.startGame();
        setGameStarted(true);
      }
    };

    on('opponent_update', handleOpponentUpdate);
    on('opponent_disconnected', handleOpponentDisconnected);
    on('opponent_reconnected', handleOpponentReconnected);
    on('game_over', handleGameOver);
    on('game_start', handleGameStart);

    return () => {
      off('opponent_update');
      off('opponent_disconnected');
      off('opponent_reconnected');
      off('game_over');
      off('game_start');
    };
  }, [socket, on, off, gameLogic.actions, gameStarted, addLog]);

  // Leave game on unmount
  useEffect(() => {
    return () => {
      if (roomId) {
        emit('leave_game', { roomId });
      }
    };
  }, [roomId, emit]);

  // Determine who is leading
  const isPlayerLeading = opponentState
    ? gameLogic.gameState.score > opponentState.score
    : true;

  const isOpponentLeading = opponentState
    ? opponentState.score > gameLogic.gameState.score
    : false;

  const leaderNickname = isPlayerLeading
    ? nickname
    : isOpponentLeading
    ? opponentNickname
    : null;

  return {
    // Player game state (from useGameLogic)
    gameState: gameLogic.gameState,
    actions: gameLogic.actions,

    // Multiplayer state
    opponentState,
    opponentNickname,
    isOpponentDisconnected,
    gameResult,
    isConnected,

    // Computed values
    isPlayerLeading,
    isOpponentLeading,
    leaderNickname,

    // Player info
    playerNickname: nickname,
    roomId,
  };
}
