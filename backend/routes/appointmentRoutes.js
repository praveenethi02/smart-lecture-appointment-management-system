import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), bookAppointment);
router.get('/my', authorize('student', 'lecturer'), getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/status', authorize('lecturer', 'admin'), updateAppointmentStatus);
router.patch('/:id/cancel', cancelAppointment);

export default router;
