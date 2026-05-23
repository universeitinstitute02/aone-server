const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/aonelube';
  const dbName = process.env.MONGODB_DB_NAME || 'aonelube';

  try {
    console.log(`Connecting to MongoDB database "${dbName}"...`);

    const conn = await mongoose.connect(connStr, {
      dbName,
      serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('\n================================================================');
    console.error('ERROR: Could not connect to MongoDB.');
    console.error(`Details: ${error.message}`);
    console.error('Server stopped because local JSON fallback is disabled.');
    console.error('================================================================\n');
    throw error;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
