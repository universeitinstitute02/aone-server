const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/aonelube';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    
    // Set a strict timeout so it doesn't hang indefinitely if MongoDB isn't running
    const options = {
      serverSelectionTimeoutMS: 5000, 
    };

    const conn = await mongoose.connect(connStr, options);
    isConnected = true;
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('\n================================================================');
    console.warn('WARNING: Could not connect to MongoDB database.');
    console.warn(`Error details: ${error.message}`);
    console.warn('The server will automatically start in "LOCAL DATA FALLBACK MODE".');
    console.warn('All CRUD operations, auth, and dashboard edits will persist in-memory/locally.');
    console.warn('================================================================\n');
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
