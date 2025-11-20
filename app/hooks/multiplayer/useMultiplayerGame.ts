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
  const [gameStartTime, setGameStartTime] = useState<number | undefined>();
  const [gameEndData, setGameEndData] = useState<{ winner: string; reason: string; roomId: string; loser?: string } | null>(null);
  const [finalPlayerScore, setFinalPlayerScore] = useState<number>(0);
  const [finalPlayerLines, setFinalPlayerLines] = useState<number>(0);
  const [finalPlayerLevel, setFinalPlayerLevel] = useState<number>(0);
  const [finalOpponentScore, setFinalOpponentScore] = useState<number>(0);
  const [finalOpponentLines, setFinalOpponentLines] = useState<number>(0);
  const [finalOpponentLevel, setFinalOpponentLevel] = useState<number>(0);
  const [rematchRequest, setRematchRequest] = useState<{ playerId: string; playerNickname: string } | null>(null);
  const [rematchTimeout, setRematchTimeout] = useState<number>(10);
  const [waitingForRematchResponse, setWaitingForRematchResponse] = useState(false);
  const [rematchWaitTimeout, setRematchWaitTimeout] = useState<number>(10);

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
  const gameStartTimeSetRef = useRef(false);
  const timeLimitEndedRef = useRef(false);
  const gameOverSentRef = useRef(false);

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

  // Send game_over immediately when game ends (not throttled)
  useEffect(() => {
    if (!isConnected || !roomId) return;
    
    // If game over and not already sent and not time limit
    if (gameLogic.gameState.gameOver && !gameOverSentRef.current && !timeLimitEndedRef.current) {
      gameOverSentRef.current = true;
      
      // Send final game update with current score
      emit('game_update', {
        type: 'game_update',
        roomId,
        board: gameLogic.gameState.board,
        score: gameLogic.gameState.score,
        lines: gameLogic.gameState.lines,
        level: gameLogic.gameState.level,
        gameOver: true,
      });
      
      // Send game_over event immediately
      emit('game_over', { roomId });
      
      addLog({
        type: 'event',
        title: 'Wysłano game_over do serwera',
        color: 'orange',
      });
    }
    
    // Reset flag when game restarts
    if (!gameLogic.gameState.gameOver && gameOverSentRef.current) {
      gameOverSentRef.current = false;
    }
  }, [isConnected, roomId, gameLogic.gameState.gameOver, emit, addLog]);

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

    const handleGameStart = (data: { roomId: string; opponent?: string; startTime?: number }) => {
      if (data.opponent) {
        setOpponentNickname(data.opponent);
        addLog({
          type: 'event',
          title: `Gra rozpoczęta vs ${data.opponent}`,
          data: { roomId: data.roomId },
          color: 'green',
        });
      }
      // Store start time from server - only set once to avoid timer jumps
      // We use local time to avoid clock skew issues between client and server
      if (data.startTime && !gameStartTimeSetRef.current) {
        setGameStartTime(Date.now());
        gameStartTimeSetRef.current = true;
      }
      // Game is auto-started, but this can serve as a backup
      if (!gameStarted) {
        gameLogic.actions.startGame();
        setGameStarted(true);
      }
    };

    const handleGameEnd = (data: { winner: string; reason: string; roomId: string; loser?: string }) => {
      console.log('handleGameEnd called with:', data);
      
      // Save final scores BEFORE resetting game
      const finalPlayerScore = gameLogic.gameState.score;
      const finalPlayerLines = gameLogic.gameState.lines;
      const finalPlayerLevel = gameLogic.gameState.level;
      const finalOpponentScore = opponentState?.score || 0;
      const finalOpponentLines = opponentState?.lines || 0;
      const finalOpponentLevel = opponentState?.level || 0;
      
      console.log('Final scores:', {
        player: { score: finalPlayerScore, lines: finalPlayerLines, level: finalPlayerLevel },
        opponent: { score: finalOpponentScore, lines: finalOpponentLines, level: finalOpponentLevel }
      });
      
      setFinalPlayerScore(finalPlayerScore);
      setFinalPlayerLines(finalPlayerLines);
      setFinalPlayerLevel(finalPlayerLevel);
      setFinalOpponentScore(finalOpponentScore);
      setFinalOpponentLines(finalOpponentLines);
      setFinalOpponentLevel(finalOpponentLevel);
      
      setGameEndData(data);
      // Stop the game (but don't reset yet - we need scores for modal)
      gameLogic.actions.endGame();
      addLog({
        type: 'event',
        title: `Koniec gry - ${data.winner} wygrywa`,
        data: { reason: data.reason, roomId: data.roomId },
        color: 'orange',
      });
      
      console.log('gameEndData set, modal should appear');
    };

    const handleRematchRequest = (data: { playerId: string; playerNickname: string; roomId: string }) => {
      setRematchRequest({
        playerId: data.playerId,
        playerNickname: data.playerNickname,
      });
      addLog({
        type: 'event',
        title: `${data.playerNickname} chce grać ponownie`,
        color: 'green',
      });

      // Start countdown
      setRematchTimeout(10);
      const interval = setInterval(() => {
        setRematchTimeout((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleRematchStart = (data: { roomId: string; opponent: string; startTime: number }) => {
      // Reset game state
      setGameEndData(null);
      setFinalPlayerScore(0);
      setFinalPlayerLines(0);
      setFinalPlayerLevel(0);
      setFinalOpponentScore(0);
      setFinalOpponentLines(0);
      setFinalOpponentLevel(0);
      setRematchRequest(null);
      setWaitingForRematchResponse(false);
      // Reset the ref flags for rematch
      gameStartTimeSetRef.current = false;
      timeLimitEndedRef.current = false;
      gameOverSentRef.current = false;
      // Use local time to avoid clock skew
      setGameStartTime(Date.now());
      gameStartTimeSetRef.current = true;
      setGameStarted(false);

      addLog({
        type: 'event',
        title: 'Rematch rozpoczęty!',
        color: 'green',
      });

      // Restart game
      gameLogic.actions.resetGame();
      gameLogic.actions.startGame();
      setGameStarted(true);
    };

    const handleRematchRejected = () => {
      setRematchRequest(null);
      setWaitingForRematchResponse(false);
      addLog({
        type: 'event',
        title: 'Rematch odrzucony',
        color: 'orange',
      });

      // Redirect to lobby after delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    };

    on('opponent_update', handleOpponentUpdate);
    on('opponent_disconnected', handleOpponentDisconnected);
    on('opponent_reconnected', handleOpponentReconnected);
    on('game_over', handleGameOver);
    on('game_start', handleGameStart);
    on('game_end', handleGameEnd);
    on('rematch_request', handleRematchRequest);
    on('rematch_start', handleRematchStart);
    on('rematch_rejected', handleRematchRejected);

    return () => {
      off('opponent_update');
      off('opponent_disconnected');
      off('opponent_reconnected');
      off('game_over');
      off('game_start');
      off('game_end');
      off('rematch_request');
      off('rematch_start');
      off('rematch_rejected');
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

  // Function to handle time limit end
  const handleTimeLimitEnd = useCallback(() => {
    if (!gameLogic.gameState.isPlaying || gameLogic.gameState.gameOver) {
      return; // Already ended
    }

    // Mark that time limit ended to prevent duplicate game_over events
    timeLimitEndedRef.current = true;

    // Stop the game locally (keep score visible)
    gameLogic.actions.endGame();

    // Send final game update with current score
    emit('game_update', {
      type: 'game_update',
      roomId,
      board: gameLogic.gameState.board,
      score: gameLogic.gameState.score,
      lines: gameLogic.gameState.lines,
      level: gameLogic.gameState.level,
      gameOver: true,
    });

    // Send game_over event with time_limit reason
    setTimeout(() => {
      emit('game_over', { roomId, reason: 'time_limit' });
    }, 50);

    addLog({
      type: 'event',
      title: 'Limit czasu osiągnięty',
      color: 'orange',
    });
  }, [gameLogic, emit, roomId, addLog]);

  // Function to send rematch request
  const sendRematchRequest = useCallback(() => {
    emit('rematch_request', { roomId });
    setWaitingForRematchResponse(true);

    // Start countdown
    setRematchWaitTimeout(10);
    const interval = setInterval(() => {
      setRematchWaitTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    addLog({
      type: 'event',
      title: 'Wysłano prośbę o rematch',
      color: 'green',
    });
  }, [emit, roomId, addLog]);

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
    gameStartTime,

    // Computed values
    isPlayerLeading,
    isOpponentLeading,
    leaderNickname,

    // Player info
    playerNickname: nickname,
    roomId,

    // Socket communication
    emit,

    // Game end state
    gameEndData,
    finalPlayerScore,
    finalPlayerLines,
    finalPlayerLevel,
    finalOpponentScore,
    finalOpponentLines,
    finalOpponentLevel,
    rematchRequest,
    rematchTimeout,

    // Rematch waiting state
    waitingForRematchResponse,
    rematchWaitTimeout,
    sendRematchRequest,

    // Time limit handler
    handleTimeLimitEnd,
  };
}
