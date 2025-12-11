import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in .env file. Database features will not work.');
      console.warn('⚠️  Payment API will still work, but other features require database connection.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Server will continue running, but database features will not work.');
    console.warn('⚠️  Payment API will still work without database connection.');
    // Don't exit - allow server to run for payment testing
  }
};

export default connectDB;

