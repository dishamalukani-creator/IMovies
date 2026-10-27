import mongoose from 'mongoose';
import dns from 'node:dns';

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getSafeErrorSummary = (error) => {
  const name = /^[A-Za-z][A-Za-z0-9]*$/.test(error?.name || '') ? error.name : 'Error';
  const code = /^[A-Za-z0-9_-]+$/.test(String(error?.code ?? '')) ? ` (${error.code})` : '';
  const message = String(error?.message || '').toLowerCase();
  let category = '';

  if (/authentication failed|bad auth|code 18/.test(message)) {
    category = ' - MongoDB authentication rejected';
  } else if (/not authorized|unauthorized/.test(message)) {
    category = ' - MongoDB authorization denied';
  } else if (/enotfound|querysrv|econnrefused|econnreset|etimedout|server selection/.test(message)) {
    category = ' - DNS or network connection failed';
  } else if (/tls|ssl|certificate/.test(message)) {
    category = ' - TLS connection failed';
  }

  return `${name}${code}${category}`;
};

/**
 * Returns human-readable MongoDB connection status
 */
export const getConnectionStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    status: READY_STATES[stateCode] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

/**
 * Connect to MongoDB database
 * @param {string} [mongoUri]
 */
export const connectDB = async (mongoUri = process.env.MONGODB_URI) => {
  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI is not defined in environment variables.');
    return null;
  }
  if (process.env.DNS_SERVERS) {
    const servers = process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
    if (servers.length > 0) {
      dns.setServers(servers);
      console.log(`🌐 Using custom DNS servers: ${servers.join(', ')}`);
    }
  }

  // Set up event listeners once
  if (mongoose.connection.listeners('connected').length === 0) {
    mongoose.connection.on('connected', () => {
      console.log(`✅ MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', getSafeErrorSummary(err));
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected.');
    });
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    return conn;
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB: ${getSafeErrorSummary(error)}`);
    console.warn('⚠️  Server will continue running in degraded mode (database unavailable).');
    return null;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
};

export default {
  connectDB,
  disconnectDB,
  getConnectionStatus,
};
