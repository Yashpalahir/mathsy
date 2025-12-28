import express from 'express';
import {
  getStudyMaterials,
  getStudyMaterial,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  getStudyMaterialPdf,
  upload,
} from '../controllers/studyMaterialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication middleware for GET - allows filtering by enrolled courses if authenticated
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Only use protect if token looks like a real JWT (not 'null', 'undefined', or empty)
  if (token && token !== 'null' && token !== 'undefined') {
    return protect(req, res, next);
  }

  // If no valid token, continue without authentication
  next();
};

router.route('/').get(optionalAuth, getStudyMaterials).post(protect, authorize('admin', 'teacher'), upload.single('pdf'), createStudyMaterial);
router
  .route('/:id')
  .get(getStudyMaterial)
  .put(protect, authorize('admin', 'teacher'), updateStudyMaterial)
  .delete(protect, authorize('admin'), deleteStudyMaterial);

router.route('/:id/pdf').get(getStudyMaterialPdf);

export default router;