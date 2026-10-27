import http from 'http';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './sockets/seatSocket.js';

const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

// Catch synchronous uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

let httpServer;
let io;

// Start server function
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  httpServer = http.createServer(app);

  // Initialize Socket.IO and attach to express app
  io = initSocket(httpServer, clientOrigin);
  app.set('io', io);

  httpServer.listen(PORT, () => {
    console.log(`🎬 IMovies Backend Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Real-time Socket.IO initialized`);
  });
};

startServer();

// Catch unhandled asynchronous promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err);
  if (httpServer) {
    httpServer.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on termination signals
const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  if (httpServer) {
    httpServer.close(async () => {
      console.log('🚪 HTTP server closed.');
      await disconnectDB();
      console.log('👋 Process terminated cleanly.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
