import express from 'express';
import { renderAdminLogin, adminLogin, addEducator } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', renderAdminLogin);
router.post('/login', adminLogin);
router.post('/add-educator', protect, adminOnly, addEducator);


export default router;

