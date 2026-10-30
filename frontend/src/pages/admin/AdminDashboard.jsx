import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  UserCheck,
  CalendarCheck2,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Settings,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentAppointments(res.data.recentAppointments);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading administrative metrics..." fullScreen />;
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-royal-400 uppercase tracking-wider">
            University Central Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">System Administration Hub</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Institutional overview, user management, policy settings, and appointment metrics
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 font-semibold text-xs shadow-md transition-all text-white"
          >
            <Settings className="w-4 h-4" />
            System Policies
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <Users className="w-4 h-4 text-royal-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats?.totalStudents}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Lecturers
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{stats?.totalLecturers}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Bookings
            </span>
            <CalendarCheck2 className="w-4 h-4 text-royal-600" />
          </div>
          <span className="text-2xl font-bold text-royal-700">{stats?.totalAppointments}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Sessions
            </span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-blue-600">{stats?.completedAppointments}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{stats?.confirmedAppointments}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Approval
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-500">{stats?.pendingAppointments}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cancelled Bookings
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600">{stats?.cancelledAppointments}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Availability Slots
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-purple-700">
            {stats?.totalAvailabilitySlots}
          </span>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/students"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-royal-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-royal-50 text-royal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Manage Students</h4>
              <p className="text-[11px] text-slate-400">View & deactivate</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-royal-600" />
        </Link>

        <Link
          to="/admin/lecturers"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-royal-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Manage Lecturers</h4>
              <p className="text-[11px] text-slate-400">Add & assign faculties</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
        </Link>

        <Link
          to="/admin/departments"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-royal-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Departments</h4>
              <p className="text-[11px] text-slate-400">Faculty categories</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600" />
        </Link>

        <Link
          to="/admin/appointments"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-royal-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">All Appointments</h4>
              <p className="text-[11px] text-slate-400">Audit logs & records</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
        </Link>
      </div>

      {/* Recent Appointments Audit */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Appointment Activity</h2>
            <p className="text-xs text-slate-500">Live feed of university booking records</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-royal-600 hover:text-royal-700 flex items-center gap-1"
          >
            Audit All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Lecturer</th>
                <th className="py-3 px-4">Slot Date & Time</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Booked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppointments.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {app.studentId?.name}
                    <span className="block font-normal text-[11px] text-slate-500">
                      {app.studentId?.registrationNumber || app.studentId?.email}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {app.lecturerId?.name}
                    <span className="block font-normal text-[11px] text-slate-500">
                      {app.lecturerId?.email}
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
                  <td className="py-3 px-4 max-w-xs truncate text-slate-700">{app.reason}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(app.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
