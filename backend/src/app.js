import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { loadBackendEnv } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';
import theatreRoutes from './routes/theatre.routes.js';
import showRoutes from './routes/show.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

loadBackendEnv();

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || origin === clientOrigin || origin === 'http://127.0.0.1:5173') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, can be tightened
      }
    },
    credentials: true,
  })
);

// HTTP request logging (disabled in test suite)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting (disabled in test suite)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins default
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      status: 'fail',
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use('/api', limiter);
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to IMovies API — Movie Ticket Booking Made Simple',
    version: '1.0.0',
    documentation: '/api/health for system status',
  });
});

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
