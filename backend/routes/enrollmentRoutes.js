import express from 'express';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  checkEnrollment,
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Check enrollment for a specific course
router.route('/check/:courseId').get(protect, checkEnrollment);

router
  .route('/')
  .get(protect, getEnrollments)
  .post(protect, createEnrollment);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateEnrollment);

export default router;

