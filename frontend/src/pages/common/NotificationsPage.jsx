import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Bell, CheckCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts regarding appointment bookings, status updates, and schedule notices
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-royal-50 hover:bg-royal-100 text-royal-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <LoadingSpinner text="Fetching notifications..." fullScreen />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You will receive alerts here when appointments are requested, confirmed, or updated."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                notif.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-royal-50/50 border-royal-200 shadow-xs text-slate-900'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.isRead
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-royal-600 text-white shadow-xs'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold truncate">{notif.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-royal-600 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
