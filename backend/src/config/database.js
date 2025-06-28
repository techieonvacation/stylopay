/**
 * MongoDB Database Configuration
 * Secure database connection for StyloPay banking application
 */

const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylopay';
    this.options = {
      // Connection settings for production banking environment
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      
      // Application identification
      appName: 'StyloPay-Backend',
      
      // Only add auth settings if needed
      ...(process.env.MONGODB_AUTH_SOURCE && { authSource: process.env.MONGODB_AUTH_SOURCE }),
    };
  }

  /**
   * Connect to MongoDB database
   */
  async connect() {
    try {
      console.log('[DATABASE] Attempting to connect to MongoDB...');
      
      await mongoose.connect(this.connectionString, this.options);
      
      console.log('[DATABASE] Successfully connected to MongoDB');
      console.log(`[DATABASE] Database: ${mongoose.connection.db.databaseName}`);
      
      // Set up connection event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('[DATABASE] MongoDB connection error:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Set up MongoDB connection event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('[DATABASE] Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('[DATABASE] Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DATABASE] Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('[DATABASE] MongoDB connection closed');
    } catch (error) {
      console.error('[DATABASE] Error closing MongoDB connection:', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[mongoose.connection.readyState],
      database: mongoose.connection.db?.databaseName || 'N/A',
      host: mongoose.connection.host || 'N/A'
    };
  }

  /**
   * Health check for database connection
   */
  async healthCheck() {
    try {
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        database: mongoose.connection.db.databaseName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
module.exports = new DatabaseConnection(); 