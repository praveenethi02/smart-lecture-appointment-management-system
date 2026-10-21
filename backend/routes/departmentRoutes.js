import express from 'express';
import Department from '../models/Department.js';

const router = express.Router();

// Public endpoint to get active departments for student registration and search dropdowns
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
