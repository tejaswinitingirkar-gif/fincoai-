import mongoose from 'mongoose';

// MONGODB_URI is checked inside the dbConnect function to avoid build-time failures when env variables are not loaded.

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("DB_CONNECT: Establishing new connection...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("DB_CONNECT: MongoDB connected.");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("DB_CONNECT_ERROR:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
