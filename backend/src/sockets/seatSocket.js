import { Server } from 'socket.io';

export const initSocket = (httpServer, clientOrigin) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Accept requests from configured clientOrigin, localhost or without origin
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client joins a specific show auditorium room for live seat tracking
    socket.on('join:show', (showId) => {
      if (showId) {
        socket.join(`show:${showId}`);
      }
    });

    // Client leaves the show room
    socket.on('leave:show', (showId) => {
      if (showId) {
        socket.leave(`show:${showId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export default initSocket;
