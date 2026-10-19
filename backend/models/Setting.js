import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    universityName: {
      type: String,
      default: 'National Apex University',
    },
    contactEmail: {
      type: String,
      default: 'appointments@apex.edu',
    },
    cancellationDeadlineHours: {
      type: Number,
      default: 2, // Cannot cancel within 2 hours of appointment start
    },
    requireLecturerApproval: {
      type: Boolean,
      default: false, // If true, new bookings are pending; if false, directly confirmed
    },
    timezone: {
      type: String,
      default: 'Asia/Colombo',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
