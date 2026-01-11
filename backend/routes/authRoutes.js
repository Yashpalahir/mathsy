import express from 'express';
import { register, login, getMe, sendOtp, loginWithOtp, completeProfile, verifyOtp, googleAuth, educatorLogin, sendWhatsAppOtp, verifyWhatsAppOtp, sendPhoneOtp, verifyPhoneOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

const router = express.Router();

// Multer Config with Cloudinary Storage
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/register', register);
router.post('/login', login);
router.post('/educator-login', educatorLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login-otp', loginWithOtp);
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.post('/google', googleAuth);


// Log when the route is accessed (this runs before passport middleware)
router.get('/google', (req, res, next) => {
    console.log('\n🚀 [OAUTH] User clicked "Login with Google"');
    console.log('🚀 [OAUTH] Redirecting to Google OAuth consent screen...');
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    (req, res, next) => {
        console.log('\n📞 [CALLBACK] Google redirected back to our server');
        console.log('📞 [CALLBACK] Processing OAuth response...');
        next();
    },
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        console.log('\n✅ [CALLBACK] OAuth successful!');
        console.log('✅ [CALLBACK] User authenticated:', req.user.email);

        // Generate token
        const token = generateToken(req.user._id);
        console.log('🎫 [CALLBACK] JWT token generated:', token.substring(0, 20) + '...');

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            console.error('❌ [CALLBACK] FRONTEND_URL is not configured');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        const redirectUrl = `${frontendUrl}/login?token=${token}`;
        console.log('🔄 [CALLBACK] Redirecting to frontend:', redirectUrl.replace(token, 'TOKEN_HIDDEN'));
        res.redirect(redirectUrl);
    }
);
router.put('/complete-profile', protect, upload.single('avatar'), completeProfile);
router.post('/send-whatsapp-otp', protect, sendWhatsAppOtp);
router.post('/verify-whatsapp-otp', protect, verifyWhatsAppOtp);
router.get('/me', protect, getMe);

export default router;

