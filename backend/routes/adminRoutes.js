import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  getDepartments,
  createDepartment,
  updateDepartment,
  getAllAppointments,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/status', toggleUserStatus);

// Department management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.patch('/departments/:id', updateDepartment);

// Appointment records
router.get('/appointments', getAllAppointments);

// System settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;
