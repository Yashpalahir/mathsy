import express from 'express';
import {
  createTest,
  getTests,
  getAllTests,
  getTest,
  submitTest,
  getTestResult,
  updateTest,
  deleteTest,
  getAllTestResults,
} from '../controllers/testController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (must come before /:id routes to avoid conflicts)
router.route('/all').get(protect, authorize('admin'), getAllTests);
router.route('/results/all').get(protect, authorize('admin'), getAllTestResults);

// Public routes for students
router.route('/').get(protect, getTests).post(protect, authorize('admin'), createTest);
router.route('/:id').get(protect, getTest);
router.route('/:id/submit').post(protect, submitTest);
router.route('/:id/result').get(protect, getTestResult);
router.route('/:id').put(protect, authorize('admin'), updateTest).delete(protect, authorize('admin'), deleteTest);

export default router;

