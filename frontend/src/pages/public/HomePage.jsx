import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  CalendarCheck,
  Clock,
  ShieldCheck,
  Bell,
  Search,
  ArrowRight,
  UserCheck,
  GraduationCap,
  Sparkles,
  Building2,
} from 'lucide-react';

export default function HomePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [featuredLecturers, setFeaturedLecturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const res = await api.get('/lecturers');
        if (res.data.success) {
          setFeaturedLecturers(res.data.lecturers.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load lecturers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLecturers();
  }, []);

  const handleQuickLogin = async (email, password, role) => {
    try {
      await login(email, password);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-navy-900 to-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-royal-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-royal-500/10 border border-royal-500/20 text-royal-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-royal-400" />
            Official Academic Appointment System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Seamless Academic Consultations at{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-400 to-blue-200">
              Apex University
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Eliminate scheduling friction. Lecturers publish availability in advance, while students
            book guaranteed, conflict-free time slots for project reviews, thesis mentorship, and
            academic guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/lecturers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-royal-600 hover:bg-royal-500 shadow-lg shadow-royal-950/40 transition-all text-sm"
            >
              <Search className="w-4 h-4" />
              Find a Lecturer
            </Link>

            {user ? (
              <Link
                to={`/${user.role}/dashboard`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-navy-800 hover:bg-navy-700 border border-slate-700 transition-all text-sm"
              >
                Go to My Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-navy-800 hover:bg-navy-700 border border-slate-700 transition-all text-sm"
              >
                Create Student Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Demo Access Bar */}
      {!user && (
        <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80">
            <div className="text-center sm:text-left mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                ⚡ Quick Demo Access (1-Click Login for Presentation Evaluation)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickLogin('admin@apex.edu', 'Admin@123', 'admin')}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-royal-500 hover:bg-royal-50/40 text-left transition-all group"
              >
                <div>
                  <span className="block text-xs font-bold text-royal-700 uppercase tracking-wider">
                    Administrator
                  </span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Dr. Arthur Pendelton
                  </span>
                  <span className="block text-xs text-slate-400">admin@apex.edu</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-royal-600 transition-colors" />
              </button>

              <button
                onClick={() => handleQuickLogin('dr.kamal@apex.edu', 'Lecturer@123', 'lecturer')}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-royal-500 hover:bg-royal-50/40 text-left transition-all group"
              >
                <div>
                  <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Lecturer
                  </span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Dr. Kamal Perera
                  </span>
                  <span className="block text-xs text-slate-400">dr.kamal@apex.edu</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => handleQuickLogin('kasun@student.apex.edu', 'Student@123', 'student')}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-royal-500 hover:bg-royal-50/40 text-left transition-all group"
              >
                <div>
                  <span className="block text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Student
                  </span>
                  <span className="block text-sm font-semibold text-slate-800">Kasun Mendis</span>
                  <span className="block text-xs text-slate-400">kasun@student.apex.edu</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-royal-600 uppercase tracking-widest">
            Key System Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Engineered for Academic Reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-royal-50 text-royal-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Real-Time Slot Availability</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Lecturers publish customized office hours and online meeting links. Students book
              confirmed appointments with zero overlap or double-booking risk.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Strict Concurrency Guarantees</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Atomic database conditional locks guarantee that two students cannot book the same slot
              concurrently. Past-date slot booking is strictly blocked.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">In-App Notification Hub</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Automatic instant notifications alert lecturers to new bookings and notify students
              when appointments are approved, rescheduled, or completed.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Lecturers Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Faculty Members</h2>
            <p className="text-sm text-slate-500 mt-1">
              Connect with professors and lecturers across university faculties
            </p>
          </div>
          <Link
            to="/lecturers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal-600 hover:text-royal-700"
          >
            View All Lecturers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredLecturers.map((lec) => (
            <div
              key={lec._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-base shadow">
                    {lec.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{lec.name}</h3>
                    <p className="text-xs text-royal-600 font-medium">{lec.department?.name}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {lec.bio || lec.specialization}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <p>
                    <span className="font-semibold text-slate-700">Specialization:</span>{' '}
                    {lec.specialization}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Office:</span>{' '}
                    {lec.officeLocation || 'Main Campus'}
                  </p>
                </div>
              </div>

              <Link
                to={`/lecturers/${lec._id}`}
                className="mt-6 w-full text-center py-2 px-4 rounded-lg bg-royal-50 hover:bg-royal-100 text-royal-700 text-xs font-semibold transition-colors block"
              >
                View Available Slots
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
