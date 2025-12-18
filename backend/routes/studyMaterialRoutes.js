import express from 'express';
import {
  getStudyMaterials,
  getStudyMaterial,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  upload,
} from '../controllers/studyMaterialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getStudyMaterials).post(protect, authorize('admin', 'teacher'), upload.single('pdf'), createStudyMaterial);
router
  .route('/:id')
  .get(getStudyMaterial)
  .put(protect, authorize('admin', 'teacher'), updateStudyMaterial)
  .delete(protect, authorize('admin'), deleteStudyMaterial);

export default router;