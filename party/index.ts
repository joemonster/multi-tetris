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
  gameOverPlayers: Set<string>; // Players who have game over
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

    // Send to opponent
    const opponentIndex = game.players.indexOf(conn.id) === 0 ? 1 : 0;
    const opponentId = game.players[opponentIndex];
    const opponentConn = this.playerConnections.get(opponentId);

    if (opponentConn) {
      opponentConn.send(JSON.stringify({
        type: 'opponent_update',
        board: data.board,
        score: data.score,
        lines: data.lines,
        level: data.level,
        gameOver: data.gameOver
      }));
    }
  }

  handleGameOver(conn: Party.Connection, roomId: string, data?: Message) {
    const game = this.games.get(roomId);
    if (!game) return;

    const playerIndex = game.players.indexOf(conn.id);
    if (playerIndex === -1) return; // Player not in this game

    // Mark player as game over
    game.gameOverPlayers.add(conn.id);

    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponentId = game.players[opponentIndex];
    const playerNickname = game.nicknames[playerIndex];
    const opponentNickname = game.nicknames[opponentIndex];

    console.log(`Player ${playerNickname} game over in ${roomId}`);

    const reason = (data?.reason as string) || 'opponent_game_over';

    // Notify both players - opponent wins
    const opponentConn = this.playerConnections.get(opponentId);
    if (opponentConn) {
      opponentConn.send(JSON.stringify({
        type: 'game_end',
        winner: opponentNickname,
        reason: reason === 'time_limit' ? 'Limit czasu' : `${playerNickname} przegrał`,
        roomId
      }));
    }

    // Notify the loser
    const loserConn = this.playerConnections.get(conn.id);
    if (loserConn) {
      loserConn.send(JSON.stringify({
        type: 'game_end',
        winner: opponentNickname,
        reason: reason === 'time_limit' ? 'Limit czasu' : `${playerNickname} przegrał`,
        roomId
      }));
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

    // Create room
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.games.set(roomId, {
      players: [player1Id, player2Id],
      nicknames: [player1Data.nickname, player2Data.nickname],
      createdAt: Date.now(),
      gameOverPlayers: new Set(),
    });

    this.playerRooms.set(player1Id, roomId);
    this.playerRooms.set(player2Id, roomId);

    // Get connections
    const conn1 = this.playerConnections.get(player1Id);
    const conn2 = this.playerConnections.get(player2Id);

    // Notify players
    if (conn1) {
      conn1.send(JSON.stringify({
        type: 'match_found',
        opponent: player2Data.nickname,
        roomId
      }));
    }

    if (conn2) {
      conn2.send(JSON.stringify({
        type: 'match_found',
        opponent: player1Data.nickname,
        roomId
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
          startTime
        }));
      }
      if (conn2) {
        conn2.send(JSON.stringify({
          type: 'game_start',
          roomId,
          opponent: player1Data.nickname,
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
    game.rematchRequested = undefined;
    const newStartTime = Date.now();
    game.startTime = newStartTime;

    // Notify both players to restart
    game.players.forEach((playerId, index) => {
      const playerConn = this.playerConnections.get(playerId);
      const opponentNickname = game.nicknames[index === 0 ? 1 : 0];
      if (playerConn) {
        playerConn.send(JSON.stringify({
          type: 'rematch_start',
          roomId,
          opponent: opponentNickname,
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
