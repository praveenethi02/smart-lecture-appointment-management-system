import React from 'react';

const STATUS_CONFIG = {
  // Appointment statuses
  confirmed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Confirmed',
  },
  pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending Approval',
  },
  completed: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Cancelled',
  },
  rejected: {
    bg: 'bg-gray-100 text-gray-700 border-gray-300',
    dot: 'bg-gray-400',
    label: 'Rejected',
  },

  // Availability statuses
  available: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Available',
  },
  booked: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Booked',
  },
  blocked: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
    label: 'Blocked',
  },
  unavailable: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-400',
    label: 'Unavailable',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toLowerCase();
  const config = STATUS_CONFIG[normalized] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
