import express from 'express';
import {
  createDemoBooking,
  getDemoBookings,
  updateDemoBooking,
  deleteDemoBooking,
} from '../controllers/demoBookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(createDemoBooking).get(protect, authorize('admin'), getDemoBookings);
router.route('/:id').put(protect, authorize('admin'), updateDemoBooking).delete(protect, authorize('admin'), deleteDemoBooking);

export default router;

