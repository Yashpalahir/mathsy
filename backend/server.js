import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import paymentsRouter from './routes/payments.js';

// Load env vars
dotenv.config();

const app = express();

// Connect to database (non-blocking)
connectDB();

// CORS configuration - allow requests from frontend
// In development, allow all origins for easier testing
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      credentials: true,
    }
  : {
      origin: true, // Allow all origins in development
      credentials: true,
    };

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/payments', paymentsRouter);

// Routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import demoBookingRoutes from './routes/demoBookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import testRoutes from './routes/testRoutes.js';

// ...existing code...

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demo-bookings', demoBookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tests', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mathsy API is running',
    timestamp: new Date().toISOString(),
  });
});

// Payment service status check
app.get('/api/payments/status', (req, res) => {
  const hasKeyId = !!(process.env.RAZORPAY_KEY_ID || process.env.key_id);
  const hasKeySecret = !!(process.env.RAZORPAY_KEY_SECRET || process.env.key_secret);
  
  res.json({
    configured: hasKeyId && hasKeySecret,
    hasKeyId,
    hasKeySecret,
    message: hasKeyId && hasKeySecret 
      ? 'Payment service is ready' 
      : 'Payment service not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💳 Payment Routes: http://localhost:${PORT}/api/payments`);
  
  // Check Razorpay configuration
  const hasRazorpayKey = process.env.RAZORPAY_KEY_ID || process.env.key_id;
  if (hasRazorpayKey) {
    console.log(`✅ Razorpay: Configured`);
  } else {
    console.log(`⚠️  Razorpay: Not configured (set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env)`);
  }
  
  // Check MongoDB configuration
  if (process.env.MONGODB_URI) {
    console.log(`📦 MongoDB: URI configured`);
  } else {
    console.log(`⚠️  MongoDB: Not configured (set MONGODB_URI in .env)`);
  }
  
  console.log('========================================\n');
});

