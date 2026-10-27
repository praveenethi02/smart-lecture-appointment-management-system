import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Building2,
  CalendarCheck2,
  Bell,
  UserCheck,
  Settings,
  Search,
  User,
  KeyRound,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/lecturers', icon: Search, label: 'Find Lecturers' },
    { to: '/student/appointments', icon: CalendarCheck2, label: 'My Appointments' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: '/student/profile', icon: User, label: 'My Profile' },
  ];

  const lecturerLinks = [
    { to: '/lecturer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lecturer/availability', icon: Clock, label: 'Manage Availability' },
    { to: '/lecturer/schedule', icon: Calendar, label: 'My Schedule' },
    { to: '/lecturer/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: '/lecturer/profile', icon: User, label: 'Lecturer Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Manage Students' },
    { to: '/admin/lecturers', icon: UserCheck, label: 'Manage Lecturers' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/appointments', icon: CalendarCheck2, label: 'All Appointments' },
    { to: '/admin/settings', icon: Settings, label: 'System Settings' },
  ];

  let links = studentLinks;
  if (user.role === 'lecturer') links = lecturerLinks;
  if (user.role === 'admin') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col shrink-0">
      {/* User Info Card in Sidebar */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <div className="w-10 h-10 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-sm shadow">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
          <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-royal-100 text-royal-800">
            {user.role}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-royal-50 text-royal-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
                <span>{link.label}</span>
              </div>
              {link.badge > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 text-xs font-bold text-white bg-rose-600 rounded-full px-1.5">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick University Info */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
        <p className="font-medium text-slate-600">Apex University Portal</p>
        <p className="mt-0.5">Academic Session 2026/2027</p>
      </div>
    </aside>
  );
}
