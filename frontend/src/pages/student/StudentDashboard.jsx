import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search,
  ArrowRight,
  Video,
  Building2,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/appointments/my');
        if (res.data.success) {
          setAppointments(res.data.appointments);
        }
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const totalBookings = appointments.length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const upcomingAppointments = appointments
    .filter((a) => ['confirmed', 'pending'].includes(a.status))
    .slice(0, 5);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-royal-400 uppercase tracking-wider">
            Student Academic Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Registration: {user.registrationNumber || 'Student'} • Timezone: Asia/Colombo (UTC+05:30)
          </p>
        </div>

        <Link
          to="/lecturers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 font-semibold text-xs shadow-md transition-all text-white shrink-0"
        >
          <Search className="w-4 h-4" />
          Find & Book a Lecturer
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Appointments
            </span>
            <CalendarCheck className="w-4 h-4 text-royal-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{totalBookings}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{confirmed}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Approval
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-500">{pending}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-blue-600">{completed}</span>
        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Upcoming Academic Sessions</h2>
            <p className="text-xs text-slate-500">Your scheduled consultations and discussions</p>
          </div>
          <Link
            to="/student/appointments"
            className="text-xs font-semibold text-royal-600 hover:text-royal-700 flex items-center gap-1"
          >
            View All ({totalBookings})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No upcoming appointments"
              description="You don't have any confirmed or pending appointments right now."
              actionLabel="Book a Lecturer"
              actionLink="/lecturers"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Lecturer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Method / Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {app.lecturerId?.name}
                      <span className="block font-normal text-[11px] text-slate-500">
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
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                      {app.reason}
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
                      <span className="block text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                        {app.availabilityId?.location}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/student/appointments"
                        className="text-xs font-semibold text-royal-600 hover:text-royal-800"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
