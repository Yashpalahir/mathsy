import express from 'express';
import {
  createContact,
  getContacts,
  updateContact,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(createContact).get(protect, authorize('admin'), getContacts);
router.route('/:id').put(protect, authorize('admin'), updateContact);

export default router;

