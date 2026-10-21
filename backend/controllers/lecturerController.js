import User from '../models/User.js';
import Availability from '../models/Availability.js';
import { isSlotInPast } from '../utils/dateUtils.js';

export const getAllLecturers = async (req, res, next) => {
  try {
    const { department, search } = req.query;

    const query = { role: 'lecturer', isActive: true };

    if (department) {
      query.department = department;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { bio: searchRegex },
      ];
    }

    const lecturers = await User.find(query)
      .populate('department', 'name code')
      .select('-passwordHash')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: lecturers.length,
      lecturers,
    });
  } catch (error) {
    next(error);
  }
};

export const getLecturerById = async (req, res, next) => {
  try {
    const lecturer = await User.findOne({
      _id: req.params.id,
      role: 'lecturer',
      isActive: true,
    })
      .populate('department', 'name code description')
      .select('-passwordHash');

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found',
      });
    }

    res.json({
      success: true,
      lecturer,
    });
  } catch (error) {
    next(error);
  }
};

export const getLecturerAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, meetingMethod } = req.query;

    // Verify lecturer exists
    const lecturer = await User.findOne({ _id: id, role: 'lecturer', isActive: true });
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found',
      });
    }

    const filter = {
      lecturerId: id,
      status: 'available',
    };

    if (date) {
      filter.date = date;
    }

    if (meetingMethod && ['in-person', 'online'].includes(meetingMethod)) {
      filter.meetingMethod = meetingMethod;
    }

    const slots = await Availability.find(filter).sort({ date: 1, startTime: 1 });

    // Filter out any slots whose start time has already passed
    const futureAvailableSlots = slots.filter(
      (slot) => !isSlotInPast(slot.date, slot.startTime)
    );

    res.json({
      success: true,
      count: futureAvailableSlots.length,
      slots: futureAvailableSlots,
    });
  } catch (error) {
    next(error);
  }
};
