import mongoose from "mongoose";

let isConnected = false; // Track the connection status

const connectDB = async () => {
  if (isConnected) {
    // Reuse existing DB connection in Lambda
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI missing. Database features will NOT work.");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Recommended for serverless
    });

    isConnected = db.connections[0].readyState === 1;

    console.log("✅ MongoDB Connected:", db.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.warn("⚠️ Continuing Lambda execution without DB...");
  }
};

export default connectDB;
