import React from 'react';
import { CalendarX2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = CalendarX2,
  title = 'No items found',
  description = 'There are no records matching your criteria at the moment.',
  actionLabel,
  actionLink,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
