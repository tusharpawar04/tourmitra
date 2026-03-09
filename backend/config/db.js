const mongoose = require('mongoose');

// Cache connection for serverless (Vercel) — prevents new connections on every invocation
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
