import express from 'express';
import { getCourseVideos, getVideo } from '../controllers/courseVideoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all videos for a course
router.route('/:courseId').get(protect, getCourseVideos);

// Get single video
router.route('/video/:id').get(protect, getVideo);

export default router;
