import express from 'express';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getEnrollments)
  .post(protect, createEnrollment);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateEnrollment);

export default router;

