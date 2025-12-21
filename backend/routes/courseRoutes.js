import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesForUser,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected route for authenticated users to get courses filtered by their class
router.route('/my-courses').get(protect, getCoursesForUser);

router.route('/').get(getCourses).post(protect, authorize('admin', 'teacher'), createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'teacher'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

export default router;

