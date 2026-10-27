import React from 'react';
import { ShieldCheck, Clock, Users, Building, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-royal-600">
          About the System
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Smart Lecturer Appointment Management System
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
          A dedicated institutional platform built for Apex University to streamline academic
          advising, project reviews, and student-lecturer engagement.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">The Problem & The Solution</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          At modern universities, faculty members balance demanding lecturing schedules, research
          commitments, and institutional administration. Consequently, students often experience
          significant hurdles attempting to schedule critical meetings for thesis evaluations,
          assignment clarifications, and academic mentorship.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          This system eliminates unscheduled drop-ins and email back-and-forth by empowering
          lecturers to publish structured, predefined time slots in advance. Students can view
          real-time availability, select convenient slots, and secure instant or approved bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-royal-50 text-royal-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Configurable Policies</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Support for cancellation deadlines (e.g., minimum 2-hour notice) prevents last-minute
            no-shows and allows freed slots to re-enter the availability pool.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Guaranteed Concurrency Safety</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Atomic MongoDB operations ensure that multiple students attempting to book the same
            slot at the exact same second are handled safely without duplicate bookings.
          </p>
        </div>
      </div>

      <div className="bg-navy-900 text-white rounded-2xl p-8 space-y-4">
        <h3 className="text-lg font-bold">University Appointment Rules Summary</h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-royal-400 shrink-0" />
            <span>All timestamps are stored consistently and displayed in Asia/Colombo time.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-royal-400 shrink-0" />
            <span>Past dates and elapsed time slots are strictly prohibited from booking.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-royal-400 shrink-0" />
            <span>Lecturers cannot schedule overlapping slots for the same day.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-royal-400 shrink-0" />
            <span>Public visitors cannot create administrative accounts.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
