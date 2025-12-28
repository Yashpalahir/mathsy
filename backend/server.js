import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

const app = express();

// Connect to database (non-blocking)
connectDB();

// CORS configuration - allow requests from frontend
// In development, allow all origins for easier testing
// const corsOptions = process.env.NODE_ENV === 'production' 
//   ? {
//       origin: process.env.FRONTEND_URL || 'http://localhost:8080',
//       credentials: true,
//     }
//   : {
//       origin: true, // Allow all origins in development
//       credentials: true,
//     };

import passport from 'passport';
import './config/passport.js'; // Import config

app.use(cors());
app.use(passport.initialize());
// Avoid parsing multipart/form-data with JSON parser (prevents 'Unexpected token -' errors)
app.use((req, res, next) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import demoBookingRoutes from './routes/demoBookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import testRoutes from './routes/testRoutes.js';
import paymentRoutes from './routes/payments.js';
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';
import courseVideoRoutes from './routes/courseVideoRoutes.js';
// ...existing code...

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demo-bookings', demoBookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/course-videos', courseVideoRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mathsy API is running',
    timestamp: new Date().toISOString(),
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
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);


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
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

  } else {
    console.log(`⚠️  MongoDB: Not configured (set MONGODB_URI in .env)`);

  }

  console.log('========================================\n');
});

