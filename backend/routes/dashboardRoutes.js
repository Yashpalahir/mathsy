import express from 'express';
import { getStudentDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/student-stats', protect, getStudentDashboardStats);

export default router;




