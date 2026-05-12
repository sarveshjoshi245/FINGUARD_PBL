/**
 * Database Connection Module
 * Handles MongoDB connection initialization
 */

const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const mongoUri = dbConfig.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured in .env');
    }

    console.log(`🔗 Connecting to MongoDB: ${mongoUri.substring(0, 50)}...`);

    // Minimal connection options for mongodb+srv
    await mongoose.connect(mongoUri);

    isConnected = true;
    console.log('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Falling back to JSON persistence (Phase 1 mode)');
    // Don't throw - allow app to run in JSON mode
    return null;
  }
};

const disconnectDB = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error);
  }
};

const getConnection = () => {
  return mongoose.connection;
};

const isMongoConnected = () => isConnected;

module.exports = {
  connectDB,
  disconnectDB,
  getConnection,
  isMongoConnected,
};
