import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), upload.single('file'), uploadFile);

export default router;
