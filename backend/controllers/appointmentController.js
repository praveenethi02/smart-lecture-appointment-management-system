import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import Setting from '../models/Setting.js';
import { isSlotInPast, isPastCancellationDeadline } from '../utils/dateUtils.js';
import { createNotification } from '../services/notificationService.js';

export const bookAppointment = async (req, res, next) => {
  try {
    const { availabilityId, reason, studentMessage } = req.body;

    if (!availabilityId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Availability slot ID and appointment reason are required',
      });
    }

    // Find slot
    const slot = await Availability.findById(availabilityId).populate(
      'lecturerId',
      'name email department'
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found',
      });
    }

    // Rule: Prevent booking past dates and times
    if (isSlotInPast(slot.date, slot.startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book an appointment for a past date or time',
      });
    }

    // Rule: Check if student already booked this slot
    const existingStudentBooking = await Appointment.findOne({
      studentId: req.user._id,
      availabilityId,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingStudentBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active appointment for this time slot',
      });
    }

    // Concurrency Safety / Double-Booking Prevention:
    // Atomic conditional update ensures only ONE concurrent request can transition
    // the slot status from 'available' to 'booked'
    const updatedSlot = await Availability.findOneAndUpdate(
      {
        _id: availabilityId,
        status: 'available',
      },
      {
        $set: { status: 'booked' },
      },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(409).json({
        success: false,
        message:
          'This slot is no longer available or was booked by another student just now.',
      });
    }

    // Read system settings for approval policy
    const settings = (await Setting.findOne()) || { requireLecturerApproval: false };
    const initialStatus = settings.requireLecturerApproval ? 'pending' : 'confirmed';

    // Create appointment record
    const appointment = await Appointment.create({
      studentId: req.user._id,
      lecturerId: slot.lecturerId._id,
      availabilityId: slot._id,
      reason,
      studentMessage: studentMessage || '',
      status: initialStatus,
      bookedAt: new Date(),
      confirmedAt: initialStatus === 'confirmed' ? new Date() : null,
    });

    // Link appointment back to slot
    updatedSlot.currentAppointmentId = appointment._id;
    await updatedSlot.save();

    // Populate for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('lecturerId', 'name email department specialization officeLocation')
      .populate('studentId', 'name email registrationNumber department')
      .populate('availabilityId');

    // Notify lecturer of new booking
    await createNotification({
      recipientId: slot.lecturerId._id,
      title: 'New Appointment Booked',
      message: `${req.user.name} booked an appointment for ${slot.date} at ${slot.startTime} (${reason}).`,
      type: 'booking_created',
      relatedAppointmentId: appointment._id,
    });

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'confirmed'
          ? 'Appointment booked and confirmed successfully!'
          : 'Appointment request submitted. Awaiting lecturer confirmation.',
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'lecturer') {
      query.lecturerId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('lecturerId', 'name email department specialization officeLocation phone')
      .populate('studentId', 'name email registrationNumber phone department')
      .populate('availabilityId')
      .sort({ createdAt: -1 });

    // Filter by slot date if provided
    let filteredAppointments = appointments;
    if (date) {
      filteredAppointments = appointments.filter(
        (app) => app.availabilityId && app.availabilityId.date === date
      );
    }

    res.json({
      success: true,
      count: filteredAppointments.length,
      appointments: filteredAppointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('lecturerId', 'name email department specialization officeLocation phone')
      .populate('studentId', 'name email registrationNumber phone department')
      .populate('availabilityId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Role-based Access: Only student, lecturer, or admin can view
    const isStudentOwner =
      req.user.role === 'student' &&
      appointment.studentId._id.toString() === req.user._id.toString();
    const isLecturerOwner =
      req.user.role === 'lecturer' &&
      appointment.lecturerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isLecturerOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to view this appointment',
      });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, lecturerResponse } = req.body;

    const allowedStatuses = ['confirmed', 'rejected', 'completed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(id).populate('availabilityId');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Ownership check: Only the lecturer or admin can update status
    if (
      req.user.role === 'lecturer' &&
      appointment.lecturerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update appointments assigned to you',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status of an already cancelled appointment',
      });
    }

    appointment.status = status;
    if (lecturerResponse !== undefined) {
      appointment.lecturerResponse = lecturerResponse;
    }

    if (status === 'confirmed') {
      appointment.confirmedAt = new Date();
    } else if (status === 'completed') {
      appointment.completedAt = new Date();
    } else if (status === 'rejected') {
      // Free up the availability slot if rejected and in the future
      if (
        appointment.availabilityId &&
        !isSlotInPast(
          appointment.availabilityId.date,
          appointment.availabilityId.startTime
        )
      ) {
        await Availability.findByIdAndUpdate(appointment.availabilityId._id, {
          status: 'available',
          currentAppointmentId: null,
        });
      }
    }

    await appointment.save();

    // Notify student
    await createNotification({
      recipientId: appointment.studentId,
      title: `Appointment ${status.toUpperCase()}`,
      message: `Your appointment has been marked as ${status} by the lecturer.${
        lecturerResponse ? ` Note: "${lecturerResponse}"` : ''
      }`,
      type: `appointment_${status}`,
      relatedAppointmentId: appointment._id,
    });

    const updated = await Appointment.findById(id)
      .populate('lecturerId', 'name email department specialization')
      .populate('studentId', 'name email registrationNumber')
      .populate('availabilityId');

    res.json({
      success: true,
      message: `Appointment marked as ${status}`,
      appointment: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(id).populate('availabilityId');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an appointment that has already been completed',
      });
    }

    // Role verification
    const isStudentOwner =
      req.user.role === 'student' &&
      appointment.studentId.toString() === req.user._id.toString();
    const isLecturerOwner =
      req.user.role === 'lecturer' &&
      appointment.lecturerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isLecturerOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this appointment',
      });
    }

    // Rule: Configurable cancellation deadline check for students
    if (isStudentOwner && appointment.availabilityId) {
      const settings = (await Setting.findOne()) || { cancellationDeadlineHours: 2 };
      const deadlineHours = settings.cancellationDeadlineHours || 2;

      if (
        isPastCancellationDeadline(
          appointment.availabilityId.date,
          appointment.availabilityId.startTime,
          deadlineHours
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Appointments cannot be cancelled less than ${deadlineHours} hour(s) before the scheduled start time.`,
        });
      }
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason =
      cancellationReason || `Cancelled by ${req.user.role}`;
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    // Rule: Re-open the availability slot for other bookings if slot is still in the future
    if (
      appointment.availabilityId &&
      !isSlotInPast(
        appointment.availabilityId.date,
        appointment.availabilityId.startTime
      )
    ) {
      await Availability.findByIdAndUpdate(appointment.availabilityId._id, {
        status: 'available',
        currentAppointmentId: null,
      });
    }

    // Send notification to the opposite party
    const targetRecipientId = isStudentOwner
      ? appointment.lecturerId
      : appointment.studentId;

    await createNotification({
      recipientId: targetRecipientId,
      title: 'Appointment Cancelled',
      message: `The appointment on ${
        appointment.availabilityId ? appointment.availabilityId.date : 'scheduled date'
      } was cancelled by ${req.user.name}.${
        cancellationReason ? ` Reason: ${cancellationReason}` : ''
      }`,
      type: 'slot_cancelled',
      relatedAppointmentId: appointment._id,
    });

    const updated = await Appointment.findById(id)
      .populate('lecturerId', 'name email department specialization')
      .populate('studentId', 'name email registrationNumber')
      .populate('availabilityId');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: updated,
    });
  } catch (error) {
    next(error);
  }
};
