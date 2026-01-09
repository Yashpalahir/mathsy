import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';
import passport from 'passport';

import connectDB from './config/db.js';
import './config/passport.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------------------------------
   🔥 Lambda-Optimized Mongo Connect
----------------------------------- */
app.use(async (req, res, next) => {
  await connectDB(); // reuses connection in Lambda
  next();
});

/* ------------ CORS ------------- */
app.use(cors({
  origin: [
    "https://mathsy.in",
    "https://www.mathsy.in",
  ],
  credentials: true,
}));

app.use(passport.initialize());

/* Avoid JSON parsing for multipart requests */
app.use((req, res, next) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---------------------------------
   ❌ REMOVED LOCAL UPLOADS STATIC FOLDER
   Because Cloudinary is used
----------------------------------- */

/* 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
REMOVED 🚫
*/

/* ---------------------------------
   📦 All Routes
----------------------------------- */
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
import feeStatusRoutes from './routes/feeStatusRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

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
app.use('/api/fee-status', feeStatusRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

/* ------------ Health Check ------------ */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mathsy API running on AWS Lambda',
    lambda: true,
    timestamp: new Date().toISOString(),
  });
});

/* ----------- 404 Handler ----------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ----------- Error Handler ----------- */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

/* --------------------------------------
   ❌ REMOVED app.listen()
   AWS Lambda does not use ports
---------------------------------------- */

/* --------------------------------------
   🚀 Export Lambda Handler
---------------------------------------- */
export const handler = serverless(app);
