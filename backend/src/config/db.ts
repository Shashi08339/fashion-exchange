// backend/src/config/db.ts
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_exchange');
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Enforce 2dsphere indexes explicitly at runtime startup
    mongoose.connection.on('index', (err) => {
      if (err) console.error('[Database] Indexing Error Encountered:', err);
    });
  } catch (error) {
    console.error(`[Database] Critical Connection Failure: ${(error as Error).message}`);
    process.exit(1);
  }
};