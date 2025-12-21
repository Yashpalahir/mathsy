import express from 'express';
import {
  getStudyMaterials,
  getStudyMaterial,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  downloadStudyMaterial,
  getStudyMaterialsForUser,
  upload,
} from '../controllers/studyMaterialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected route for authenticated users to get study materials filtered by their class
router.route('/my-materials').get(protect, getStudyMaterialsForUser);

router.route('/').get(getStudyMaterials).post(protect, authorize('admin', 'teacher'), upload.single('pdf'), createStudyMaterial);
router.get('/:id/download', downloadStudyMaterial);
router
  .route('/:id')
  .get(getStudyMaterial)
  .put(protect, authorize('admin', 'teacher'), updateStudyMaterial)
  .delete(protect, authorize('admin'), deleteStudyMaterial);

export default router;