import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Building2,
  XCircle,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterDate) params.date = filterDate;

      const res = await api.get('/appointments/my', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, filterDate]);

  const handleOpenCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelError('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    try {
      setCancelling(true);
      setCancelError('');

      const res = await api.patch(
        `/appointments/${selectedAppointment._id}/cancel`,
        {
          cancellationReason: cancelReason || 'Cancelled by student',
        }
      );

      if (res.data.success) {
        setCancelModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setCancelError(
        err.response?.data?.message ||
          'Failed to cancel appointment. You may be within the cancellation deadline window.'
      );
    } finally {
      setCancelling(false);
    }
  };

  const statuses = [
    { id: 'all', label: 'All' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your appointment history, view meeting links, or cancel upcoming bookings
        </p>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === s.id
                  ? 'bg-royal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white w-full sm:w-auto"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner text="Fetching your appointments..." fullScreen />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="There are no appointments matching your current filter criteria."
          actionLabel="Browse Lecturers"
          actionLink="/lecturers"
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => {
            const canCancel = ['pending', 'confirmed'].includes(app.status);

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {app.lecturerId?.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {app.lecturerId?.name}
                      </h3>
                      <p className="text-xs text-royal-600 font-medium">
                        {app.lecturerId?.department?.name || 'Faculty Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    {canCancel && (
                      <button
                        onClick={() => handleOpenCancelModal(app)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-500 block mb-0.5">Date & Time</span>
                    <span className="font-bold text-slate-800">
                      {app.availabilityId?.date} ({app.availabilityId?.startTime} -{' '}
                      {app.availabilityId?.endTime})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-500 block mb-0.5">Meeting Method</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {app.availabilityId?.meetingMethod === 'online' ? (
                        <Video className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {app.availabilityId?.meetingMethod === 'online' ? 'Online' : 'In-Person'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-500 block mb-0.5">Location / Link</span>
                    <span className="font-mono text-slate-700 truncate block">
                      {app.availabilityId?.location}
                    </span>
                  </div>
                </div>

                {/* Reason & Notes */}
                <div className="space-y-1.5 text-xs">
                  <p>
                    <span className="font-semibold text-slate-700">Reason:</span>{' '}
                    <span className="text-slate-800">{app.reason}</span>
                  </p>
                  {app.studentMessage && (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-700">Your Message:</span>{' '}
                      {app.studentMessage}
                    </p>
                  )}
                  {app.lecturerResponse && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900 mt-2">
                      <span className="font-semibold">Lecturer Note / Response:</span>{' '}
                      {app.lecturerResponse}
                    </div>
                  )}
                  {app.cancellationReason && (
                    <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-lg text-rose-900 mt-2">
                      <span className="font-semibold">Cancellation Reason:</span>{' '}
                      {app.cancellationReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {cancelModalOpen && selectedAppointment && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Appointment"
        >
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <p className="font-semibold">Cancellation Policy Notice:</p>
              <p className="mt-0.5">
                Cancellations cannot be made within the university's 2-hour deadline window before
                the scheduled start time. Once cancelled, the slot will be released for other students.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cancelError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly explain why you are cancelling this appointment..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Keep Appointment
              </button>
              <button
                type="submit"
                disabled={cancelling}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
