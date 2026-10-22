import express from 'express';
import {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availabilityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('lecturer', 'admin'), getAvailability);
router.post('/', authorize('lecturer'), createAvailability);
router.patch('/:id', authorize('lecturer', 'admin'), updateAvailability);
router.delete('/:id', authorize('lecturer', 'admin'), deleteAvailability);

export default router;
