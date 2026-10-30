import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  CalendarCheck2,
  Search,
  Calendar,
  Clock,
  Video,
  Building2,
  Eye,
  User,
} from 'lucide-react';

export default function AllAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Details Modal
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/appointments', { params });
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
  }, [statusFilter, dateFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All University Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete institutional registry and audit logs for all student-lecturer consultations
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, lecturer, or consultation reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAppointments()}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="w-full md:w-44 flex items-center gap-1.5">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={fetchAppointments}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors w-full md:w-auto"
        >
          Filter
        </button>
      </div>

      {/* Appointments Audit Table */}
      {loading ? (
        <LoadingSpinner text="Loading appointment registry..." fullScreen />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No appointment records found"
          description="Try adjusting your search criteria or date filter."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Lecturer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {app.studentId?.name}
                      <span className="block font-normal text-[11px] text-slate-400">
                        {app.studentId?.registrationNumber || app.studentId?.email}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {app.lecturerId?.name}
                      <span className="block font-normal text-[11px] text-slate-400">
                        {app.lecturerId?.department?.name || 'Department Faculty'}
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
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700 font-medium">
                      {app.reason}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1 text-slate-400 hover:text-royal-600 rounded hover:bg-slate-100"
                        title="Audit Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Audit Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title="Appointment Audit Record"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-mono text-slate-400">ID: {selectedApp._id}</span>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-600 block mb-1">Student</span>
                <p className="font-semibold text-slate-800">{selectedApp.studentId?.name}</p>
                <p className="text-slate-500">{selectedApp.studentId?.email}</p>
                <p className="text-slate-500 font-mono">
                  Reg: {selectedApp.studentId?.registrationNumber || 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-600 block mb-1">Lecturer</span>
                <p className="font-semibold text-slate-800">{selectedApp.lecturerId?.name}</p>
                <p className="text-slate-500">{selectedApp.lecturerId?.email}</p>
                <p className="text-slate-500">
                  {selectedApp.lecturerId?.department?.name || 'Department Faculty'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <p>
                <span className="font-semibold text-slate-700">Scheduled:</span>{' '}
                {selectedApp.availabilityId?.date} from {selectedApp.availabilityId?.startTime} to{' '}
                {selectedApp.availabilityId?.endTime}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Method:</span>{' '}
                <span className="capitalize">{selectedApp.availabilityId?.meetingMethod}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">Location / Link:</span>{' '}
                <span className="font-mono">{selectedApp.availabilityId?.location}</span>
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Topic / Reason:</span>
              <p className="text-slate-800 bg-white p-2 rounded border border-slate-200">
                {selectedApp.reason}
              </p>
            </div>

            {selectedApp.studentMessage && (
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Student Notes:</span>
                <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                  {selectedApp.studentMessage}
                </p>
              </div>
            )}

            {selectedApp.lecturerResponse && (
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Lecturer Response:</span>
                <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                  {selectedApp.lecturerResponse}
                </p>
              </div>
            )}

            {selectedApp.cancellationReason && (
              <div>
                <span className="font-bold text-rose-700 block mb-0.5">Cancellation Reason:</span>
                <p className="text-rose-900 bg-rose-50 p-2 rounded border border-rose-200">
                  {selectedApp.cancellationReason}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
              <p>Booked At: {new Date(selectedApp.bookedAt).toLocaleString()}</p>
              {selectedApp.confirmedAt && (
                <p>Confirmed At: {new Date(selectedApp.confirmedAt).toLocaleString()}</p>
              )}
              {selectedApp.completedAt && (
                <p>Completed At: {new Date(selectedApp.completedAt).toLocaleString()}</p>
              )}
              {selectedApp.cancelledAt && (
                <p>Cancelled At: {new Date(selectedApp.cancelledAt).toLocaleString()}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
