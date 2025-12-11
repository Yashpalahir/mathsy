import express from 'express';
import {
  createReview,
  getReviews,
  getAllReviews,
  deleteReview,
  updateReviewStatus,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes - anyone can create and view reviews
router.route('/').post(createReview).get(getReviews);

// Admin routes
router.route('/all').get(protect, authorize('admin'), getAllReviews);
router.route('/:id').delete(protect, authorize('admin'), deleteReview).put(protect, authorize('admin'), updateReviewStatus);

export default router;

