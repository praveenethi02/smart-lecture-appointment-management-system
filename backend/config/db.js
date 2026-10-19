import mongoose from 'mongoose';

let mongodInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
      // Direct Atlas connection or specified remote URI
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to MongoDB Atlas/Remote: ${conn.connection.host}`);
      return conn;
    }

    // Attempt local connection with a short timeout first
    try {
      const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/university_appointments', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[MongoDB] Connected to local MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log('[MongoDB] Local MongoDB server not detected, starting in-memory MongoDB instance for development/testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to in-memory MongoDB at ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
