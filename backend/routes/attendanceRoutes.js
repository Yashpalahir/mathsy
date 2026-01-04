import express from 'express';
import { generateToken, scanQR } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Generate token - Student only
router.post('/generate', protect, authorize('student'), generateToken);

// Scan QR - Educator/Admin only
router.post('/scan', protect, authorize('educator', 'admin'), scanQR);

export default router;

