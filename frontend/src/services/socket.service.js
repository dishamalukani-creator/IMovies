import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // Clean console log
    });

    socket.on('connect_error', () => {
      // Sockets fallback cleanly if backend is disconnected
    });
  }
  return socket;
};

export const joinShowRoom = (showId) => {
  const s = getSocket();
  if (s && showId) {
    s.emit('join:show', showId);
  }
};

export const leaveShowRoom = (showId) => {
  const s = getSocket();
  if (s && showId) {
    s.emit('leave:show', showId);
  }
};

export default {
  getSocket,
  joinShowRoom,
  leaveShowRoom,
};
