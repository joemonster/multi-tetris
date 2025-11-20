import type * as Party from "partykit/server";

// Types
interface Player {
  odniecie: string;
  nickname: string;
  joinedAt: number;
}

interface GameRoom {
  players: string[];
  nicknames: string[];
  createdAt: number;
  startTime?: number;
  gameOverPlayers: Set<string>; // Players who lost BEFORE time limit (not time_limit)
  playerScores: Map<string, number>; // Current scores for each player
  playerLines: Map<string, number>; // Current lines for each player
  playerLevels: Map<string, number>; // Current levels for each player
  timeLimitEnded: Set<string>; // Players who sent time_limit game_over
  rematchRequested?: {
    playerId: string;
    timestamp: number;
  };
}

interface Message {
  type: string;
  [key: string]: unknown;
}

export default class TetrisServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // In-memory state
  queue: Map<string, Player> = new Map();
  games: Map<string, GameRoom> = new Map();
  playerRooms: Map<string, string> = new Map();
  playerConnections: Map<string, Party.Connection> = new Map();

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Player connected: ${conn.id}`);
    this.playerConnections.set(conn.id, conn);

    // Send current online count to new player
    const onlineCount = this.playerConnections.size;
    conn.send(JSON.stringify({ type: 'online_count', count: onlineCount }));

    // Broadcast updated count to all players
    this.broadcastOnlineCount();
  }

  onClose(conn: Party.Connection) {
    console.log(`Player disconnected: ${conn.id}`);

    // Remove from queue
    if (this.queue.has(conn.id)) {
      this.queue.delete(conn.id);
      this.updateQueuePositions();
    }

    // Handle game disconnect
    const roomId = this.playerRooms.get(conn.id);
    if (roomId) {
      const game = this.games.get(roomId);
      if (game) {
        // Notify opponent
        const opponentIndex = game.players.indexOf(conn.id) === 0 ? 1 : 0;
        const opponentId = game.players[opponentIndex];
        const opponentConn = this.playerConnections.get(opponentId);

        if (opponentConn) {
          opponentConn.send(JSON.stringify({ type: 'opponent_disconnected' }));

          // Set timeout for auto-win
          setTimeout(() => {
            const currentGame = this.games.get(roomId);
            if (currentGame && currentGame.players.includes(conn.id)) {
              const opponentNickname = currentGame.nicknames[opponentIndex];

              opponentConn.send(JSON.stringify({
                type: 'game_over',
                winner: opponentNickname,
                reason: 'Przeciwnik się rozłączył'
              }));

              // Cleanup
              this.games.delete(roomId);
              currentGame.players.forEach(id => this.playerRooms.delete(id));
            }
          }, 60000);
        }
      }
      this.playerRooms.delete(conn.id);
    }

    this.playerConnections.delete(conn.id);

    // Broadcast updated count to all players
    this.broadcastOnlineCount();
  }

  onMessage(message: string, sender: Party.Connection) {
    let data: Message;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    switch (data.type) {
      case 'find_game':
        this.handleFindGame(sender, data.nickname as string);
        break;
      case 'cancel_queue':
        this.handleCancelQueue(sender);
        break;
      case 'game_update':
        this.handleGameUpdate(sender, data);
        break;
      case 'game_over':
        this.handleGameOver(sender, data.roomId as string, data);
        break;
      case 'leave_game':
        this.handleLeaveGame(sender, data.roomId as string);
        break;
      case 'rematch_request':
        this.handleRematchRequest(sender, data.roomId as string);
        break;
      case 'rematch_accept':
        this.handleRematchAccept(sender, data.roomId as string);
        break;
      case 'rematch_reject':
        this.handleRematchReject(sender, data.roomId as string);
        break;
    }
  }

  handleFindGame(conn: Party.Connection, nickname: string) {
    // Check if already in queue or game
    if (this.queue.has(conn.id)) {
      conn.send(JSON.stringify({ type: 'error', message: 'Już jesteś w kolejce' }));
      return;
    }
    if (this.playerRooms.has(conn.id)) {
      conn.send(JSON.stringify({ type: 'error', message: 'Już jesteś w grze' }));
      return;
    }

    // Add to queue
    this.queue.set(conn.id, {
      odniecie: conn.id,
      nickname: nickname || `GRACZ_${Math.floor(Math.random() * 10000)}`,
      joinedAt: Date.now()
    });

    console.log(`Player ${nickname} joined queue. Size: ${this.queue.size}`);

    // Notify player
    conn.send(JSON.stringify({ type: 'queue_joined', position: this.queue.size }));

    // Update positions
    this.updateQueuePositions();

    // Try matchmaking
    this.tryMatchmaking();

    // Queue timeout (2 minutes)
    setTimeout(() => {
      if (this.queue.has(conn.id)) {
        this.queue.delete(conn.id);
        conn.send(JSON.stringify({ type: 'queue_timeout' }));
        this.updateQueuePositions();
      }
    }, 120000);
  }

  handleCancelQueue(conn: Party.Connection) {
    if (this.queue.has(conn.id)) {
      this.queue.delete(conn.id);
      console.log(`Player left queue. Size: ${this.queue.size}`);
      this.updateQueuePositions();
    }
  }

  handleGameUpdate(conn: Party.Connection, data: Message) {
    const roomId = this.playerRooms.get(conn.id);
    if (!roomId) return;

    const game = this.games.get(roomId);
    if (!game) return;

    // Update player stats
    const score = (data.score as number) || 0;
    const lines = (data.lines as number) || 0;
    const level = (data.level as number) || 0;
    game.playerScores.set(conn.id, score);
    game.playerLines.set(conn.id, lines);
    game.playerLevels.set(conn.id, level);

    // Send to opponent
    const opponentIndex = game.players.indexOf(conn.id) === 0 ? 1 : 0;
    const opponentId = game.players[opponentIndex];
    const opponentConn = this.playerConnections.get(opponentId);

    if (opponentConn) {
      // Get nickname of the player who sent this update
      const playerIndex = game.players.indexOf(conn.id);
      const playerNickname = game.nicknames[playerIndex] || (data.nickname as string) || 'Unknown';
      
      opponentConn.send(JSON.stringify({
        type: 'opponent_update',
        board: data.board,
        score: data.score,
        lines: data.lines,
        level: data.level,
        gameOver: data.gameOver,
        nickname: playerNickname // Include nickname of the player who sent this update
      }));
    }
  }

  handleGameOver(conn: Party.Connection, roomId: string, data?: Message) {
    const game = this.games.get(roomId);
    if (!game) return;

    const playerIndex = game.players.indexOf(conn.id);
    if (playerIndex === -1) return; // Player not in this game

    const reason = (data?.reason as string) || 'opponent_game_over';
    const isTimeLimit = reason === 'time_limit';

    // If time limit, mark this player and check if both players have ended
    if (isTimeLimit) {
      const opponentIndex = playerIndex === 0 ? 1 : 0;
      const opponentId = game.players[opponentIndex];
      const playerNickname = game.nicknames[playerIndex];
      const opponentNickname = game.nicknames[opponentIndex];
      
      // Check if opponent already lost before time limit - if so, THIS player wins (opponent lost)
      if (game.gameOverPlayers.has(opponentId)) {
        const playerScore = game.playerScores.get(conn.id) || 0;
        const opponentScore = game.playerScores.get(opponentId) || 0;
        
        console.log(`Player ${playerNickname} ended due to time limit, but opponent ${opponentNickname} lost before time limit in ${roomId}`);
        
        // Player wins (opponent lost before time limit)
        // Send personalized message to each player
        const reasonText = `${opponentNickname} przegrał przed czasem (wynik: ${playerScore} vs ${opponentScore})`;
        
        const opponentConn = this.playerConnections.get(opponentId);
        if (opponentConn) {
          const loserMessage = JSON.stringify({
            type: 'game_end',
            roomId,
            winnerNickname: playerNickname,
            winnerScore: playerScore,
            loserNickname: opponentNickname,
            loserScore: opponentScore,
            isWinner: false,
            reason: reasonText
          });
          opponentConn.send(loserMessage);
        }
        
        const timeLimitWinnerConn = this.playerConnections.get(conn.id);
        if (timeLimitWinnerConn) {
          const winnerMessage = JSON.stringify({
            type: 'game_end',
            roomId,
            winnerNickname: playerNickname,
            winnerScore: playerScore,
            loserNickname: opponentNickname,
            loserScore: opponentScore,
            isWinner: true,
            reason: reasonText
          });
          timeLimitWinnerConn.send(winnerMessage);
        }
        
        game.timeLimitEnded.add(conn.id);
        return;
      }
      
      game.timeLimitEnded.add(conn.id);
      
      // Check if both players have sent time_limit
      if (game.timeLimitEnded.size === 2) {
        // Both players ended due to time limit - compare scores
        const player1Id = game.players[0];
        const player2Id = game.players[1];
        const player1Score = game.playerScores.get(player1Id) || 0;
        const player2Score = game.playerScores.get(player2Id) || 0;
        
        let winnerNickname: string;
        let reasonText: string;
        
        if (player1Score > player2Score) {
          winnerNickname = game.nicknames[0];
          reasonText = `Limit czasu - wyższy wynik (${player1Score} vs ${player2Score})`;
        } else if (player2Score > player1Score) {
          winnerNickname = game.nicknames[1];
          reasonText = `Limit czasu - wyższy wynik (${player2Score} vs ${player1Score})`;
        } else {
          // Tie - could be random or both win, let's say player 1 wins on tie
          winnerNickname = game.nicknames[0];
          reasonText = `Limit czasu - remis (${player1Score} vs ${player2Score})`;
        }
        
        // Notify both players with same neutral message - client will personalize it
        const loserNickname = winnerNickname === game.nicknames[0] ? game.nicknames[1] : game.nicknames[0];
        const winnerScore = winnerNickname === game.nicknames[0] ? player1Score : player2Score;
        const loserScore = winnerNickname === game.nicknames[0] ? player2Score : player1Score;
        
        // Send same message to both players - client will personalize it
        game.players.forEach((playerId) => {
          const playerConn = this.playerConnections.get(playerId);
          if (playerConn) {
            // Determine if this specific player is the winner
            const isWinner = playerId === (winnerNickname === game.nicknames[0] ? game.players[0] : game.players[1]);
            
            const gameEndMessage = JSON.stringify({
              type: 'game_end',
              roomId,
              winnerNickname,
              winnerScore,
              loserNickname,
              loserScore,
              isWinner,
              reason: reasonText
            });
            playerConn.send(gameEndMessage);
          }
        });
        
        // Mark both as game over
        game.gameOverPlayers.add(player1Id);
        game.gameOverPlayers.add(player2Id);
        
        console.log(`Time limit ended in ${roomId} - Winner: ${winnerNickname} (${player1Score} vs ${player2Score})`);
        return;
      } else {
        // Only one player has sent time_limit, wait a bit for the other
        // Set a timeout to handle if the other player doesn't respond
        setTimeout(() => {
          const currentGame = this.games.get(roomId);
          if (!currentGame) return;
          
          // Check if opponent lost before time limit
          if (currentGame.gameOverPlayers.has(opponentId)) {
            // Opponent lost before time limit - they win
            const playerScore = currentGame.playerScores.get(conn.id) || 0;
            const opponentScore = currentGame.playerScores.get(opponentId) || 0;
            
            // Send personalized message to each player
            const reasonText = `${playerNickname} przegrał przed czasem (wynik: ${opponentScore} vs ${playerScore})`;
            
            const winnerConn = this.playerConnections.get(opponentId);
            const loserConn = this.playerConnections.get(conn.id);
            
            if (winnerConn) {
              const winnerMessage = JSON.stringify({
                type: 'game_end',
                roomId,
                winnerNickname: opponentNickname,
                winnerScore: opponentScore,
                loserNickname: playerNickname,
                loserScore: playerScore,
                isWinner: true,
                reason: reasonText
              });
              winnerConn.send(winnerMessage);
            }
            if (loserConn) {
              const loserMessage = JSON.stringify({
                type: 'game_end',
                roomId,
                winnerNickname: opponentNickname,
                winnerScore: opponentScore,
                loserNickname: playerNickname,
                loserScore: playerScore,
                isWinner: false,
                reason: reasonText
              });
              loserConn.send(loserMessage);
            }
            
            currentGame.timeLimitEnded.add(conn.id);
            return;
          }
          
          // If still only one player has ended due to time limit, proceed with score comparison
          if (currentGame.timeLimitEnded.size === 1 && currentGame.timeLimitEnded.has(conn.id)) {
            const player1Id = currentGame.players[0];
            const player2Id = currentGame.players[1];
            const player1Score = currentGame.playerScores.get(player1Id) || 0;
            const player2Score = currentGame.playerScores.get(player2Id) || 0;
            
            let winnerNickname: string;
            let reasonText: string;
            
            if (player1Score > player2Score) {
              winnerNickname = currentGame.nicknames[0];
              reasonText = `Limit czasu - wyższy wynik (${player1Score} vs ${player2Score})`;
            } else if (player2Score > player1Score) {
              winnerNickname = currentGame.nicknames[1];
              reasonText = `Limit czasu - wyższy wynik (${player2Score} vs ${player1Score})`;
            } else {
              winnerNickname = currentGame.nicknames[0];
              reasonText = `Limit czasu - remis (${player1Score} vs ${player2Score})`;
            }
            
            // Notify both players with same message - client will personalize it
            const loserNickname = winnerNickname === currentGame.nicknames[0] ? currentGame.nicknames[1] : currentGame.nicknames[0];
            const winnerScore = winnerNickname === currentGame.nicknames[0] ? player1Score : player2Score;
            const loserScore = winnerNickname === currentGame.nicknames[0] ? player2Score : player1Score;
            
            // Send same message to both players
            currentGame.players.forEach((playerId) => {
              const playerConn = this.playerConnections.get(playerId);
              if (playerConn) {
                // Determine if this specific player is the winner
                const isWinner = playerId === (winnerNickname === currentGame.nicknames[0] ? currentGame.players[0] : currentGame.players[1]);

                const gameEndMessage = JSON.stringify({
                  type: 'game_end',
                  roomId,
                  winnerNickname,
                  winnerScore,
                  loserNickname,
                  loserScore,
                  isWinner,
                  reason: reasonText
                });
                playerConn.send(gameEndMessage);
              }
            });
            
            currentGame.gameOverPlayers.add(player1Id);
            currentGame.gameOverPlayers.add(player2Id);
          }
        }, 1000); // Wait 1 second for the other player
        
        return; // Don't proceed with normal game over handling
      }
    }

    // Normal game over (not time limit) - player lost before time limit
    // If someone loses before time limit, they ALWAYS lose regardless of score
    
    // IMPORTANT: Check if opponent ended due to time limit - if so, this player loses immediately
    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponentId = game.players[opponentIndex];
    
    // If opponent already ended due to time limit, this player loses (they lost before time limit)
    if (game.timeLimitEnded.has(opponentId)) {
      const playerNickname = game.nicknames[playerIndex];
      const opponentNickname = game.nicknames[opponentIndex];
      const playerScore = game.playerScores.get(conn.id) || 0;
      const opponentScore = game.playerScores.get(opponentId) || 0;
      
      console.log(`Player ${playerNickname} lost before time limit, but opponent ${opponentNickname} ended due to time limit in ${roomId}`);
      
      // Opponent wins (they ended due to time limit, this player lost before)
      // Send same neutral message to both players
      // Actually we need to customize isWinner for each
      
      const opponentConn = this.playerConnections.get(opponentId);
      if (opponentConn) {
        const winnerMessage = JSON.stringify({
            type: 'game_end',
            roomId,
            winnerNickname: opponentNickname,
            winnerScore: opponentScore,
            loserNickname: playerNickname,
            loserScore: playerScore,
            isWinner: true
        });
        opponentConn.send(winnerMessage);
      }
      
      const loserConn = this.playerConnections.get(conn.id);
      if (loserConn) {
        const loserMessage = JSON.stringify({
            type: 'game_end',
            roomId,
            winnerNickname: opponentNickname,
            winnerScore: opponentScore,
            loserNickname: playerNickname,
            loserScore: playerScore,
            isWinner: false
        });
        loserConn.send(loserMessage);
      }
      
      game.gameOverPlayers.add(conn.id);
      return;
    }
    
    // Add to gameOverPlayers (lost before time limit)
    game.gameOverPlayers.add(conn.id);

    const playerNickname = game.nicknames[playerIndex];
    const opponentNickname = game.nicknames[opponentIndex];
    const playerScore = game.playerScores.get(conn.id) || 0;
    const opponentScore = game.playerScores.get(opponentId) || 0;

    console.log(`Player ${playerNickname} lost before time limit in ${roomId}`);
    console.log(`Opponent ${opponentNickname} wins immediately (could still play, but game ends)`);
    console.log(`Scores: ${opponentNickname}=${opponentScore}, ${playerNickname}=${playerScore}`);

    // IMPORTANT: When one player loses before time limit, the game ends immediately
    // The opponent wins, even if they could still play
    // This is NOT a remis - one player lost, so the other wins
    
    // Send personalized message to each player with their own nickname
    const reasonText = `${playerNickname} przegrał przed czasem${opponentScore > playerScore ? ` (wynik: ${opponentScore} vs ${playerScore})` : ''}`;
    
      // Send to winner (opponent)
    const opponentConn = this.playerConnections.get(opponentId);
    if (opponentConn) {
      const winnerMessage = JSON.stringify({
        type: 'game_end',
        roomId,
        winnerNickname: opponentNickname,
        winnerScore: opponentScore,
        loserNickname: playerNickname,
        loserScore: playerScore,
        isWinner: true,
        reason: reasonText
      });
      opponentConn.send(winnerMessage);
      console.log(`Sent game_end to winner ${opponentNickname} (${opponentId}):`, winnerMessage);
    } else {
      console.log(`ERROR: Opponent connection not found for ${opponentId}`);
    }

    // Send to loser (current player)
    const loserConn = this.playerConnections.get(conn.id);
    if (loserConn) {
      const loserMessage = JSON.stringify({
        type: 'game_end',
        roomId,
        winnerNickname: opponentNickname,
        winnerScore: opponentScore,
        loserNickname: playerNickname,
        loserScore: playerScore,
        isWinner: false,
        reason: reasonText
      });
      loserConn.send(loserMessage);
      console.log(`Sent game_end to loser ${playerNickname} (${conn.id}):`, loserMessage);
    } else {
      console.log(`ERROR: Loser connection not found for ${conn.id}`);
    }
  }

  handleLeaveGame(conn: Party.Connection, roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    this.playerRooms.delete(conn.id);

    // Notify opponent
    const opponentIndex = game.players.indexOf(conn.id) === 0 ? 1 : 0;
    const opponentId = game.players[opponentIndex];
    const opponentConn = this.playerConnections.get(opponentId);

    if (opponentConn) {
      opponentConn.send(JSON.stringify({ type: 'opponent_disconnected' }));
    }

    console.log(`Player ${conn.id} left room ${roomId}`);
  }

  tryMatchmaking() {
    if (this.queue.size < 2) return;

    const players = Array.from(this.queue.entries());
    const [player1Id, player1Data] = players[0];
    const [player2Id, player2Data] = players[1];

    // Remove from queue
    this.queue.delete(player1Id);
    this.queue.delete(player2Id);

    // Create room with match time
    const matchFoundTime = Date.now();
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.games.set(roomId, {
      players: [player1Id, player2Id],
      nicknames: [player1Data.nickname, player2Data.nickname],
      createdAt: matchFoundTime,
      gameOverPlayers: new Set(),
      playerScores: new Map(),
      playerLines: new Map(),
      playerLevels: new Map(),
      timeLimitEnded: new Set(),
    });

    this.playerRooms.set(player1Id, roomId);
    this.playerRooms.set(player2Id, roomId);

    // Get connections
    const conn1 = this.playerConnections.get(player1Id);
    const conn2 = this.playerConnections.get(player2Id);

    // Notify players with match found time for synchronized countdown
    if (conn1) {
      conn1.send(JSON.stringify({
        type: 'match_found',
        opponent: player2Data.nickname,
        playerNickname: player1Data.nickname, // Send player's own nickname from server
        roomId,
        matchFoundTime
      }));
    }

    if (conn2) {
      conn2.send(JSON.stringify({
        type: 'match_found',
        opponent: player1Data.nickname,
        playerNickname: player2Data.nickname, // Send player's own nickname from server
        roomId,
        matchFoundTime
      }));
    }

    console.log(`Match: ${roomId} - ${player1Data.nickname} vs ${player2Data.nickname}`);

    // Start game after countdown
    setTimeout(() => {
      const startTime = Date.now();

      // Update game room with start time
      const game = this.games.get(roomId);
      if (game) {
        game.startTime = startTime;
      }

      if (conn1) {
        conn1.send(JSON.stringify({
          type: 'game_start',
          roomId,
          opponent: player2Data.nickname,
          playerNickname: player1Data.nickname, // Send player's own nickname from server
          startTime
        }));
      }
      if (conn2) {
        conn2.send(JSON.stringify({
          type: 'game_start',
          roomId,
          opponent: player1Data.nickname,
          playerNickname: player2Data.nickname, // Send player's own nickname from server
          startTime
        }));
      }
    }, 3000);
  }

  updateQueuePositions() {
    let position = 1;
    this.queue.forEach((_, odniecie) => {
      const conn = this.playerConnections.get(odniecie);
      if (conn) {
        conn.send(JSON.stringify({ type: 'queue_update', position }));
      }
      position++;
    });
  }

  handleRematchRequest(conn: Party.Connection, roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    const playerIndex = game.players.indexOf(conn.id);
    if (playerIndex === -1) return;

    const playerNickname = game.nicknames[playerIndex];
    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponentId = game.players[opponentIndex];

    // Store rematch request
    game.rematchRequested = {
      playerId: conn.id,
      timestamp: Date.now(),
    };

    console.log(`Rematch requested by ${playerNickname} in ${roomId}`);

    // Notify opponent
    const opponentConn = this.playerConnections.get(opponentId);
    if (opponentConn) {
      opponentConn.send(JSON.stringify({
        type: 'rematch_request',
        playerId: conn.id,
        playerNickname,
        roomId,
      }));
    }

    // Set timeout - 10 seconds
    setTimeout(() => {
      const currentGame = this.games.get(roomId);
      if (currentGame && currentGame.rematchRequested?.playerId === conn.id) {
        // Timeout - reject rematch
        this.handleRematchReject(conn, roomId);
      }
    }, 10000);
  }

  handleRematchAccept(conn: Party.Connection, roomId: string) {
    const game = this.games.get(roomId);
    if (!game || !game.rematchRequested) return;

    console.log(`Rematch accepted in ${roomId}`);

    // Reset game state for rematch
    game.gameOverPlayers.clear();
    game.playerScores.clear();
    game.playerLines.clear();
    game.playerLevels.clear();
    game.timeLimitEnded.clear();
    game.rematchRequested = undefined;
    const newStartTime = Date.now();
    game.startTime = newStartTime;

    // Notify both players to restart
    game.players.forEach((playerId, index) => {
      const playerConn = this.playerConnections.get(playerId);
      const playerNickname = game.nicknames[index];
      const opponentNickname = game.nicknames[index === 0 ? 1 : 0];
      if (playerConn) {
        playerConn.send(JSON.stringify({
          type: 'rematch_start',
          roomId,
          opponent: opponentNickname,
          playerNickname: playerNickname, // Send player's own nickname from server
          startTime: newStartTime,
        }));
      }
    });
  }

  handleRematchReject(conn: Party.Connection, roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    console.log(`Rematch rejected in ${roomId}`);

    game.rematchRequested = undefined;

    // Notify both players that rematch was rejected
    game.players.forEach((playerId) => {
      const playerConn = this.playerConnections.get(playerId);
      if (playerConn) {
        playerConn.send(JSON.stringify({
          type: 'rematch_rejected',
          roomId,
        }));
      }
    });

    // Cleanup game after a short delay
    setTimeout(() => {
      this.games.delete(roomId);
      game.players.forEach(id => this.playerRooms.delete(id));
    }, 2000);
  }

  broadcastOnlineCount() {
    const onlineCount = this.playerConnections.size;
    this.playerConnections.forEach((conn) => {
      conn.send(JSON.stringify({ type: 'online_count', count: onlineCount }));
    });
  }
}

TetrisServer satisfies Party.Worker;
