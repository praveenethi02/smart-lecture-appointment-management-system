import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import {
  isSlotInPast,
  isValidTimeRange,
  doTimesOverlap,
} from '../utils/dateUtils.js';

export const getAvailability = async (req, res, next) => {
  try {
    const { date, status, lecturerId } = req.query;

    const query = {};

    if (req.user.role === 'lecturer') {
      // Lecturers only view their own slots
      query.lecturerId = req.user._id;
    } else if (req.user.role === 'admin' && lecturerId) {
      query.lecturerId = lecturerId;
    }

    if (date) {
      query.date = date;
    }

    if (status) {
      query.status = status;
    }

    const slots = await Availability.find(query)
      .populate('lecturerId', 'name email department specialization')
      .populate({
        path: 'currentAppointmentId',
        populate: { path: 'studentId', select: 'name email registrationNumber' },
      })
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

export const createAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime, location, meetingMethod, notes } = req.body;

    if (!date || !startTime || !endTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, end time, and location are required',
      });
    }

    // Validate time format and ordering
    if (!isValidTimeRange(startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time, and slot duration must be at least 5 minutes',
      });
    }

    // Rule: Prevent slots in the past
    if (isSlotInPast(date, startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create availability slots for past dates or times',
      });
    }

    // Rule: Check for overlapping slots for the same lecturer on the same day
    const existingSlots = await Availability.find({
      lecturerId: req.user._id,
      date,
      status: { $ne: 'unavailable' },
    });

    for (const slot of existingSlots) {
      if (doTimesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: `This slot overlaps with an existing slot from ${slot.startTime} to ${slot.endTime} on ${date}`,
        });
      }
    }

    const newSlot = await Availability.create({
      lecturerId: req.user._id,
      date,
      startTime,
      endTime,
      location,
      meetingMethod: meetingMethod || 'in-person',
      notes: notes || '',
      status: 'available',
    });

    res.status(201).json({
      success: true,
      message: 'Availability slot created successfully',
      slot: newSlot,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, location, meetingMethod, notes, status } = req.body;

    const slot = await Availability.findById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found',
      });
    }

    // Ownership check: Only the owning lecturer or admin can update
    if (req.user.role === 'lecturer' && slot.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only modify your own availability slots',
      });
    }

    // Rule: Do not allow modifying a slot that is already booked by a student
    if (slot.status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit an availability slot that is already booked by a student',
      });
    }

    const targetDate = date || slot.date;
    const targetStart = startTime || slot.startTime;
    const targetEnd = endTime || slot.endTime;

    // Validate time range if times changed
    if (startTime || endTime) {
      if (!isValidTimeRange(targetStart, targetEnd)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }
    }

    // Rule: Cannot move slot to the past
    if ((date || startTime) && isSlotInPast(targetDate, targetStart)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot move slot to a past date or time',
      });
    }

    // Check overlaps if times or date changed
    if (date || startTime || endTime) {
      const existingSlots = await Availability.find({
        lecturerId: slot.lecturerId,
        date: targetDate,
        _id: { $ne: slot._id },
        status: { $ne: 'unavailable' },
      });

      for (const other of existingSlots) {
        if (doTimesOverlap(targetStart, targetEnd, other.startTime, other.endTime)) {
          return res.status(400).json({
            success: false,
            message: `Updated slot overlaps with an existing slot (${other.startTime} - ${other.endTime})`,
          });
        }
      }
    }

    if (date) slot.date = date;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (location) slot.location = location;
    if (meetingMethod) slot.meetingMethod = meetingMethod;
    if (notes !== undefined) slot.notes = notes;
    if (status && ['available', 'blocked', 'unavailable'].includes(status)) {
      slot.status = status;
    }

    await slot.save();

    res.json({
      success: true,
      message: 'Availability slot updated successfully',
      slot,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slot = await Availability.findById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found',
      });
    }

    // Ownership check
    if (req.user.role === 'lecturer' && slot.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own availability slots',
      });
    }

    // Rule: Do not allow deleting a slot with an active appointment
    if (slot.status === 'booked') {
      const activeAppointment = await Appointment.findOne({
        availabilityId: slot._id,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (activeAppointment) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete an availability slot that has an active booking. Cancel the appointment first.',
        });
      }
    }

    await Availability.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Availability slot deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
