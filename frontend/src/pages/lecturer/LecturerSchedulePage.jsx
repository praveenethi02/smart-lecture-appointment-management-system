import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  Check,
  X,
  XCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export default function LecturerSchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(''); // 'confirm', 'reject', 'complete', 'cancel'
  const [responseNote, setResponseNote] = useState('');
  const [processing, setProcessing] = useState(false);

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

  const handleOpenActionModal = (app, type) => {
    setSelectedApp(app);
    setActionType(type);
    setResponseNote('');
    setStatusModalOpen(true);
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);

      if (actionType === 'cancel') {
        await api.patch(`/appointments/${selectedApp._id}/cancel`, {
          cancellationReason: responseNote || 'Cancelled by lecturer',
        });
      } else {
        // 'confirm' -> 'confirmed', 'reject' -> 'rejected', 'complete' -> 'completed'
        const targetStatus =
          actionType === 'confirm'
            ? 'confirmed'
            : actionType === 'reject'
            ? 'rejected'
            : 'completed';

        await api.patch(`/appointments/${selectedApp._id}/status`, {
          status: targetStatus,
          lecturerResponse: responseNote,
        });
      }

      setStatusModalOpen(false);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultation Schedule & Bookings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review booked students, confirm pending requests, and record session feedback
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-royal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
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

      {/* Schedule Items */}
      {loading ? (
        <LoadingSpinner text="Fetching schedule..." fullScreen />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="There are no student consultations matching your current criteria."
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
            >
              {/* Card Top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {app.studentId?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {app.studentId?.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Reg: {app.studentId?.registrationNumber || 'Student'} • {app.studentId?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />

                  {/* Actions for Pending */}
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOpenActionModal(app, 'confirm')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(app, 'reject')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  {/* Actions for Confirmed */}
                  {app.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleOpenActionModal(app, 'complete')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(app, 'cancel')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-500 block mb-0.5">Session Time</span>
                  <span className="font-bold text-slate-800">
                    {app.availabilityId?.date} ({app.availabilityId?.startTime} -{' '}
                    {app.availabilityId?.endTime})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-500 block mb-0.5">Method & Location</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    {app.availabilityId?.meetingMethod === 'online' ? (
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    {app.availabilityId?.meetingMethod === 'online' ? 'Online' : 'In-Person'}
                  </span>
                  <span className="font-mono text-slate-500 truncate block text-[11px] mt-0.5">
                    {app.availabilityId?.location}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-500 block mb-0.5">Student Contact</span>
                  <span className="text-slate-700 block">{app.studentId?.email}</span>
                  {app.studentId?.phone && (
                    <span className="text-slate-500 text-[11px] block">{app.studentId.phone}</span>
                  )}
                </div>
              </div>

              {/* Consultation Topic */}
              <div className="space-y-1.5 text-xs">
                <p>
                  <span className="font-semibold text-slate-700">Topic / Reason:</span>{' '}
                  <span className="text-slate-900 font-medium">{app.reason}</span>
                </p>
                {app.studentMessage && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Student Message:</span>{' '}
                    {app.studentMessage}
                  </p>
                )}
                {app.lecturerResponse && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900 mt-2">
                    <span className="font-semibold">Your Session Feedback / Advice:</span>{' '}
                    {app.lecturerResponse}
                  </div>
                )}
                {app.cancellationReason && (
                  <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-lg text-rose-900 mt-2">
                    <span className="font-semibold">Cancellation Note:</span>{' '}
                    {app.cancellationReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Dialog Modal */}
      {statusModalOpen && selectedApp && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={
            actionType === 'confirm'
              ? 'Confirm Appointment Request'
              : actionType === 'reject'
              ? 'Reject Appointment Request'
              : actionType === 'complete'
              ? 'Mark Appointment as Completed'
              : 'Cancel Appointment'
          }
        >
          <form onSubmit={handleExecuteAction} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p>
                <span className="font-semibold">Student:</span> {selectedApp.studentId?.name}
              </p>
              <p>
                <span className="font-semibold">Scheduled Date:</span>{' '}
                {selectedApp.availabilityId?.date} ({selectedApp.availabilityId?.startTime} -{' '}
                {selectedApp.availabilityId?.endTime})
              </p>
              <p>
                <span className="font-semibold">Reason:</span> {selectedApp.reason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {actionType === 'complete'
                  ? 'Consultation Summary / Student Advice (Optional)'
                  : actionType === 'cancel' || actionType === 'reject'
                  ? 'Explanation / Reason for Student'
                  : 'Note for Student (Optional)'}
              </label>
              <textarea
                rows={3}
                required={actionType === 'reject'}
                placeholder="Enter message for the student..."
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={processing}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm disabled:opacity-50 ${
                  actionType === 'cancel' || actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-royal-600 hover:bg-royal-700'
                }`}
              >
                {processing ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
