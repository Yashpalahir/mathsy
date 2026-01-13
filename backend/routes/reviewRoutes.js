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

// Public routes - anyone can view reviews
router.route('/').get(getReviews);

// Protected routes
router.route('/').post(protect, createReview);

// Admin routes
router.route('/all').get(protect, authorize('admin'), getAllReviews);
router.route('/:id').delete(protect, authorize('admin'), deleteReview).put(protect, authorize('admin'), updateReviewStatus);

export default router;

