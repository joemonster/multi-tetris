import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// Type definitions for socket events
export interface ServerToClientEvents {
  queue_joined: (data: { position: number }) => void;
  queue_update: (data: { position: number }) => void;
  match_found: (data: { opponent: string; roomId: string }) => void;
  queue_timeout: () => void;
  game_start: (data: { roomId: string }) => void;
  opponent_update: (data: OpponentState) => void;
  opponent_disconnected: () => void;
  opponent_reconnected: () => void;
  game_over: (data: { winner: string; reason: string }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  find_game: (data: { nickname: string }) => void;
  cancel_queue: () => void;
  game_update: (data: GameUpdateData) => void;
  game_over: (data: { roomId: string }) => void;
  leave_game: (data: { roomId: string }) => void;
}

export interface OpponentState {
  board: Array<Array<{ filled: boolean; color: string }>>;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
}

export interface GameUpdateData {
  roomId: string;
  board: Array<Array<{ filled: boolean; color: string }>>;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
}
