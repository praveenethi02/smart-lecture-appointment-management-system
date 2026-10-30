import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  PlusCircle,
  Calendar,
  Building2,
  Video,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complete / Note modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [lecturerResponse, setLecturerResponse] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, slotRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/availability'),
      ]);

      if (appRes.data.success) {
        setAppointments(appRes.data.appointments);
      }
      if (slotRes.data.success) {
        setSlots(slotRes.data.slots);
      }
    } catch (err) {
      console.error('Failed to load lecturer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const bookedSlots = slots.filter((s) => s.status === 'booked').length;
  const pendingRequests = appointments.filter((a) => a.status === 'pending').length;
  const confirmedSessions = appointments.filter((a) => a.status === 'confirmed').length;

  const upcomingBookings = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status))
    .slice(0, 5);

  const handleOpenCompleteModal = (app) => {
    setSelectedApp(app);
    setLecturerResponse('');
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    try {
      setSavingStatus(true);
      await api.patch(`/appointments/${selectedApp._id}/status`, {
        status: 'completed',
        lecturerResponse,
      });
      setCompleteModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading lecturer dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-royal-400 uppercase tracking-wider">
            Faculty Office Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Welcome, {user.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {user.department?.name || 'Department Faculty'} • {user.officeLocation || 'Main Campus'}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/lecturer/availability"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 font-semibold text-xs shadow-md transition-all text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Add Availability Slot
          </Link>
          <Link
            to="/lecturer/schedule"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-700 font-semibold text-xs transition-all text-slate-200"
          >
            <Calendar className="w-4 h-4" />
            Full Schedule
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Slots Created
            </span>
            <Clock className="w-4 h-4 text-royal-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{totalSlots}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Open / Available Slots
            </span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{availableSlots}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed Bookings
            </span>
            <CheckCircle className="w-4 h-4 text-royal-600" />
          </div>
          <span className="text-2xl font-bold text-royal-700">{confirmedSessions}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Booked Slots
            </span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-bold text-indigo-600">{bookedSlots}</span>
        </div>
      </div>

      {/* Upcoming Student Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Upcoming Student Consultations</h2>
            <p className="text-xs text-slate-500">
              Student appointments requiring attendance or completion
            </p>
          </div>
          <Link
            to="/lecturer/schedule"
            className="text-xs font-semibold text-royal-600 hover:text-royal-700 flex items-center gap-1"
          >
            View Full Schedule
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No upcoming consultations"
              description="You have no booked appointments for future dates right now."
              actionLabel="Manage Availability"
              actionLink="/lecturer/availability"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reason & Message</th>
                  <th className="py-3 px-4">Meeting Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingBookings.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {app.studentId?.name}
                      <span className="block font-normal text-[11px] text-slate-500">
                        {app.studentId?.registrationNumber || app.studentId?.email}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block text-slate-800">
                        {app.availabilityId?.date}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {app.availabilityId?.startTime} - {app.availabilityId?.endTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-semibold text-slate-800 block truncate">
                        {app.reason}
                      </span>
                      {app.studentMessage && (
                        <span className="text-[11px] text-slate-500 block truncate">
                          "{app.studentMessage}"
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        {app.availabilityId?.meetingMethod === 'online' ? (
                          <Video className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Building2 className="w-3 h-3 text-blue-600" />
                        )}
                        {app.availabilityId?.meetingMethod === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => handleOpenCompleteModal(app)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                      <Link
                        to="/lecturer/schedule"
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {completeModalOpen && selectedApp && (
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title="Conclude Consultation Session"
        >
          <form onSubmit={handleConfirmComplete} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p>
                <span className="font-semibold">Student:</span> {selectedApp.studentId?.name} (
                {selectedApp.studentId?.registrationNumber})
              </p>
              <p>
                <span className="font-semibold">Reason:</span> {selectedApp.reason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lecturer Response / Session Feedback (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Enter consultation summary, advised action items, or feedback for the student..."
                value={lecturerResponse}
                onChange={(e) => setLecturerResponse(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingStatus}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {savingStatus ? 'Saving...' : 'Mark as Completed'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
