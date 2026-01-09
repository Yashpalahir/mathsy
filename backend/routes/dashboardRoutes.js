import express from 'express';
import { getStudentDashboardStats, updateUserProfile } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

const router = express.Router();

// Multer Config with Cloudinary Storage
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get('/student-stats', protect, getStudentDashboardStats);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

export default router;
