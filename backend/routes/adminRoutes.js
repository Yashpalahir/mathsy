import express from 'express';
import { renderAdminLogin, adminLogin } from '../controllers/authController.js';

const router = express.Router();

router.get('/', renderAdminLogin);
router.post('/login', adminLogin);

export default router;

