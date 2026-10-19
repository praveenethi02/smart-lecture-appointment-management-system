import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lecturer ID is required'],
    },
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    startTime: {
      type: String, // HH:mm (24-hour)
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:mm (24-hour)'],
    },
    endTime: {
      type: String, // HH:mm (24-hour)
      required: [true, 'End time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be HH:mm (24-hour)'],
    },
    location: {
      type: String,
      required: [true, 'Location or meeting link/details is required'],
      trim: true,
    },
    meetingMethod: {
      type: String,
      enum: ['in-person', 'online'],
      default: 'in-person',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'blocked', 'unavailable'],
      default: 'available',
      required: true,
    },
    // Optional reference to the active appointment booking this slot
    currentAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup and slot availability searches
availabilitySchema.index({ lecturerId: 1, date: 1, status: 1 });
availabilitySchema.index({ date: 1, status: 1 });

export default mongoose.model('Availability', availabilitySchema);
