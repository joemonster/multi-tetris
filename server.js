const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Game state
const queue = new Map(); // socketId -> { nickname, joinedAt }
const rooms = new Map(); // roomId -> { players: [socketId, socketId], state: {} }
const playerRooms = new Map(); // socketId -> roomId

// Generate unique room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Matchmaking logic
function tryMatchmaking() {
  if (queue.size < 2) return;

  const players = Array.from(queue.entries());
  const [player1Id, player1Data] = players[0];
  const [player2Id, player2Data] = players[1];

  // Remove from queue
  queue.delete(player1Id);
  queue.delete(player2Id);

  // Create room
  const roomId = generateRoomId();
  rooms.set(roomId, {
    players: [player1Id, player2Id],
    nicknames: [player1Data.nickname, player2Data.nickname],
    state: {
      player1: null,
      player2: null,
    },
    createdAt: Date.now(),
  });

  playerRooms.set(player1Id, roomId);
  playerRooms.set(player2Id, roomId);

  // Join socket room
  const socket1 = io.sockets.sockets.get(player1Id);
  const socket2 = io.sockets.sockets.get(player2Id);

  if (socket1) socket1.join(roomId);
  if (socket2) socket2.join(roomId);

  // Notify players
  if (socket1) {
    socket1.emit('match_found', {
      opponent: player2Data.nickname,
      roomId,
    });
  }

  if (socket2) {
    socket2.emit('match_found', {
      opponent: player1Data.nickname,
      roomId,
    });
  }

  console.log(`Match created: ${roomId} - ${player1Data.nickname} vs ${player2Data.nickname}`);

  // Start game after 3 seconds (countdown time)
  setTimeout(() => {
    if (socket1) {
      socket1.emit('game_start', { roomId, opponent: player2Data.nickname });
    }
    if (socket2) {
      socket2.emit('game_start', { roomId, opponent: player1Data.nickname });
    }
  }, 3000);
}

// Update queue positions for all waiting players
function updateQueuePositions() {
  let position = 1;
  queue.forEach((data, socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('queue_update', { position });
    }
    position++;
  });
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Find game (join queue)
  socket.on('find_game', ({ nickname }) => {
    // Check if already in queue
    if (queue.has(socket.id)) {
      socket.emit('error', { message: 'Już jesteś w kolejce' });
      return;
    }

    // Check if already in game
    if (playerRooms.has(socket.id)) {
      socket.emit('error', { message: 'Już jesteś w grze' });
      return;
    }

    // Add to queue
    queue.set(socket.id, {
      nickname: nickname || `GRACZ_${Math.floor(Math.random() * 10000)}`,
      joinedAt: Date.now(),
    });

    console.log(`Player ${nickname} joined queue. Queue size: ${queue.size}`);

    // Notify player
    socket.emit('queue_joined', { position: queue.size });

    // Update all queue positions
    updateQueuePositions();

    // Try to match players
    tryMatchmaking();

    // Set timeout for queue (2 minutes)
    setTimeout(() => {
      if (queue.has(socket.id)) {
        queue.delete(socket.id);
        socket.emit('queue_timeout');
        updateQueuePositions();
      }
    }, 120000);
  });

  // Cancel queue
  socket.on('cancel_queue', () => {
    if (queue.has(socket.id)) {
      queue.delete(socket.id);
      console.log(`Player left queue. Queue size: ${queue.size}`);
      updateQueuePositions();
    }
  });

  // Game state update
  socket.on('game_update', (data) => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Send to opponent
    socket.to(roomId).emit('opponent_update', {
      board: data.board,
      score: data.score,
      lines: data.lines,
      level: data.level,
      gameOver: data.gameOver,
    });
  });

  // Game over
  socket.on('game_over', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.indexOf(socket.id);
    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponentId = room.players[opponentIndex];
    const opponentNickname = room.nicknames[opponentIndex];

    // Notify both players
    io.to(roomId).emit('game_over', {
      winner: opponentNickname,
      reason: 'Przeciwnik zakończył grę',
    });
  });

  // Leave game
  socket.on('leave_game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.leave(roomId);
    playerRooms.delete(socket.id);

    // Notify opponent
    socket.to(roomId).emit('opponent_disconnected');

    console.log(`Player ${socket.id} left room ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Remove from queue
    if (queue.has(socket.id)) {
      queue.delete(socket.id);
      updateQueuePositions();
    }

    // Handle game disconnect
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        // Notify opponent
        socket.to(roomId).emit('opponent_disconnected');

        // Set timeout for reconnection (60 seconds)
        setTimeout(() => {
          const currentRoom = rooms.get(roomId);
          if (currentRoom && currentRoom.players.includes(socket.id)) {
            // Player didn't reconnect, opponent wins
            const opponentIndex = currentRoom.players.indexOf(socket.id) === 0 ? 1 : 0;
            const opponentId = currentRoom.players[opponentIndex];
            const opponentNickname = currentRoom.nicknames[opponentIndex];

            io.to(roomId).emit('game_over', {
              winner: opponentNickname,
              reason: 'Przeciwnik się rozłączył',
            });

            // Cleanup room
            rooms.delete(roomId);
            currentRoom.players.forEach(id => playerRooms.delete(id));
          }
        }, 60000);
      }

      playerRooms.delete(socket.id);
    }
  });
});

// Get online players count endpoint
io.engine.on('connection_error', (err) => {
  console.log('Connection error:', err.message);
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

// Periodic cleanup of stale rooms
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    // Remove rooms older than 1 hour
    if (now - room.createdAt > 3600000) {
      room.players.forEach(id => playerRooms.delete(id));
      rooms.delete(roomId);
      console.log(`Cleaned up stale room: ${roomId}`);
    }
  });
}, 60000);

module.exports = { io, httpServer };
