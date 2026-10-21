import express from 'express';
import {
  getAllLecturers,
  getLecturerById,
  getLecturerAvailability,
} from '../controllers/lecturerController.js';

const router = express.Router();

router.get('/', getAllLecturers);
router.get('/:id', getLecturerById);
router.get('/:id/availability', getLecturerAvailability);

export default router;
