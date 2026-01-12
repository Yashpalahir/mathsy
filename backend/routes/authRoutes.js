import express from 'express';
import { getMe, completeProfile, verifyPhoneOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

const router = express.Router();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});



router.post('/verify-phone-otp', verifyPhoneOtp);
router.put('/complete-profile', protect, upload.single('avatar'), completeProfile);
router.get('/me', protect, getMe);

export default router;

