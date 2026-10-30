import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Settings,
  Building,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [universityName, setUniversityName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState(2);
  const [requireLecturerApproval, setRequireLecturerApproval] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        if (res.data.success && res.data.settings) {
          setSettings(res.data.settings);
          setUniversityName(res.data.settings.universityName || 'National Apex University');
          setContactEmail(res.data.settings.contactEmail || 'appointments@apex.edu');
          setCancellationDeadlineHours(
            res.data.settings.cancellationDeadlineHours !== undefined
              ? res.data.settings.cancellationDeadlineHours
              : 2
          );
          setRequireLecturerApproval(
            res.data.settings.requireLecturerApproval !== undefined
              ? res.data.settings.requireLecturerApproval
              : false
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.patch('/admin/settings', {
        universityName,
        contactEmail,
        cancellationDeadlineHours: Number(cancellationDeadlineHours),
        requireLecturerApproval,
      });

      if (res.data.success) {
        setSuccessMsg('System policies and institutional settings updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading system settings..." fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Policies & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure university booking rules, cancellation notice deadlines, and approval workflows
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Institutional Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-royal-600" />
              University Identity
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Name
              </label>
              <input
                type="text"
                required
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Central Appointment Support Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          {/* Appointment Policies */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-royal-600" />
              Appointment & Cancellation Rules
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Cancellation Deadline (Hours prior to slot start)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="48"
                  required
                  value={cancellationDeadlineHours}
                  onChange={(e) => setCancellationDeadlineHours(e.target.value)}
                  className="w-32 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 font-semibold"
                />
                <span className="text-xs text-slate-500">
                  Hours notice required. (Students cannot cancel once this threshold is reached).
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="approvalToggle"
                checked={requireLecturerApproval}
                onChange={(e) => setRequireLecturerApproval(e.target.checked)}
                className="mt-0.5 rounded text-royal-600 focus:ring-royal-500"
              />
              <label htmlFor="approvalToggle" className="cursor-pointer">
                <span className="block text-xs font-bold text-slate-800">
                  Require Lecturer Confirmation for New Bookings
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  When enabled, all student bookings enter a "Pending" status and require the lecturer
                  to manually confirm or reject. When disabled, bookings are confirmed immediately.
                </span>
              </label>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Standard System Timezone: <strong className="font-semibold">Asia/Colombo (UTC+05:30)</strong>. All slot timestamps adhere strictly to institutional time.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating Policies...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
