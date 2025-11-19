import PartySocket from "partysocket";

let socket: PartySocket | null = null;

export const getSocket = (): PartySocket => {
  if (!socket) {
    socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999",
      room: "tetris-lobby",
    });
  }
  return socket;
};

export const connectSocket = (): PartySocket => {
  const s = getSocket();
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

// Type definitions for messages
export interface OpponentState {
  board: Array<Array<{ filled: boolean; color: string }>>;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
}

export interface GameUpdateData {
  type: string;
  roomId: string;
  board: Array<Array<{ filled: boolean; color: string }>>;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
}
