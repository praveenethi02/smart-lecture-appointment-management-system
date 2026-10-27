import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Video,
  Building2,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export default function LecturerProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [lecturer, setLecturer] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  // Booking Modal State
  const [bookingSlot, setBookingSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [studentMessage, setStudentMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchLecturerAndSlots = async () => {
      try {
        setLoading(true);
        const [lecRes, slotRes] = await Promise.all([
          api.get(`/lecturers/${id}`),
          api.get(`/lecturers/${id}/availability`, {
            params: selectedDate ? { date: selectedDate } : {},
          }),
        ]);

        if (lecRes.data.success) {
          setLecturer(lecRes.data.lecturer);
        }
        if (slotRes.data.success) {
          setSlots(slotRes.data.slots);
        }
      } catch (err) {
        console.error('Error loading lecturer profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerAndSlots();
  }, [id, selectedDate]);

  const handleOpenBookingModal = (slot) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/lecturers/${id}` } });
      return;
    }
    if (user.role !== 'student') {
      alert('Only students can book appointment slots. Please sign in with a student account.');
      return;
    }
    setBookingSlot(slot);
    setReason('');
    setStudentMessage('');
    setBookingError('');
    setBookingSuccess(null);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setBookingError('Please enter a reason for the appointment');
      return;
    }

    try {
      setSubmitting(true);
      setBookingError('');

      const res = await api.post('/appointments', {
        availabilityId: bookingSlot._id,
        reason: reason.trim(),
        studentMessage: studentMessage.trim(),
      });

      if (res.data.success) {
        setBookingSuccess(res.data.appointment);
        // Refresh available slots
        const updatedSlotsRes = await api.get(`/lecturers/${id}/availability`, {
          params: selectedDate ? { date: selectedDate } : {},
        });
        if (updatedSlotsRes.data.success) {
          setSlots(updatedSlotsRes.data.slots);
        }
      }
    } catch (err) {
      setBookingError(
        err.response?.data?.message ||
          'Failed to book appointment. The slot may have just been booked by another student.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !lecturer) {
    return <LoadingSpinner text="Loading lecturer profile & slots..." fullScreen />;
  }

  if (!lecturer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="Lecturer not found"
          description="The requested faculty member does not exist or has been deactivated."
          actionLabel="Browse Lecturers"
          actionLink="/lecturers"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/lecturers"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-royal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Lecturers
      </Link>

      {/* Lecturer Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {lecturer.name.charAt(0)}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {lecturer.name}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Faculty
              </span>
            </div>
            <p className="text-sm font-semibold text-royal-600">
              {lecturer.department?.name || 'Academic Faculty'}
            </p>
            <p className="text-xs text-slate-500">
              Employee ID: {lecturer.employeeId || 'N/A'} • Timezone: Asia/Colombo (UTC+05:30)
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-500 block mb-1">Specialization</span>
            <span className="font-medium text-slate-800">{lecturer.specialization}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-500 block mb-1">Office Location</span>
            <span className="font-medium text-slate-800">{lecturer.officeLocation || 'Main Campus'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-500 block mb-1">Official Email</span>
            <span className="font-medium text-slate-800 truncate block">{lecturer.email}</span>
          </div>
        </div>

        {lecturer.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Faculty Biography & Research Focus
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{lecturer.bio}</p>
          </div>
        )}
      </div>

      {/* Available Slots Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available Appointment Slots</h2>
            <p className="text-xs text-slate-500">
              Showing upcoming open consultation slots. All times are in university local time (Asia/Colombo).
            </p>
          </div>

          {/* Filter by specific date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {slots.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No open slots right now"
            description={
              selectedDate
                ? `No availability published on ${selectedDate}. Try choosing another date.`
                : 'This lecturer currently has no open appointment slots. Please check back later.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-royal-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-royal-600" />
                      {slot.date}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        slot.meetingMethod === 'online'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {slot.meetingMethod === 'online' ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <Building2 className="w-3 h-3" />
                      )}
                      {slot.meetingMethod === 'online' ? 'Online' : 'In-Person'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 text-slate-900">
                    <Clock className="w-4 h-4 text-slate-400 self-center" />
                    <span className="text-lg font-bold">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Location: </span>
                    <span className="truncate block font-mono text-[11px] text-slate-500">
                      {slot.location}
                    </span>
                  </div>

                  {slot.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-semibold">Note:</span> {slot.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-2">
                  <button
                    onClick={() => handleOpenBookingModal(slot)}
                    className="w-full py-2 px-3 rounded-lg bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Book This Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingSlot && (
        <Modal
          isOpen={!!bookingSlot}
          onClose={() => setBookingSlot(null)}
          title="Confirm Appointment Booking"
        >
          {bookingSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your appointment with <span className="font-semibold">{lecturer.name}</span> on{' '}
                <span className="font-semibold">{bookingSlot.date}</span> at{' '}
                <span className="font-semibold">{bookingSlot.startTime}</span> has been confirmed.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  to="/student/appointments"
                  className="px-4 py-2 text-xs font-semibold text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm"
                >
                  View in My Appointments
                </Link>
                <button
                  onClick={() => setBookingSlot(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Slot Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p>
                  <span className="font-semibold text-slate-700">Lecturer:</span> {lecturer.name}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Scheduled Time:</span>{' '}
                  {bookingSlot.date} from {bookingSlot.startTime} to {bookingSlot.endTime}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Location / Link:</span>{' '}
                  {bookingSlot.location}
                </p>
              </div>

              {bookingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Form inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FYP Architecture review, Assignment guidance"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Details for Lecturer (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, questions, or topics you want to discuss..."
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Confirming Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
