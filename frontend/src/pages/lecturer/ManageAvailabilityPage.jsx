import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Video,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function ManageAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Form Fields
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [meetingMethod, setMeetingMethod] = useState('in-person');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus !== 'all') params.status = filterStatus;

      const res = await api.get('/availability', { params });
      if (res.data.success) {
        setSlots(res.data.slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filterDate, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingSlot(null);
    setDate('');
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('Faculty Office, Room 304');
    setMeetingMethod('in-person');
    setNotes('');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (slot) => {
    if (slot.status === 'booked') {
      alert('Cannot edit a slot that is already booked by a student.');
      return;
    }
    setEditingSlot(slot);
    setDate(slot.date);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setLocation(slot.location);
    setMeetingMethod(slot.meetingMethod);
    setNotes(slot.notes || '');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSubmitSlot = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !location) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const payload = {
        date,
        startTime,
        endTime,
        location,
        meetingMethod,
        notes,
      };

      if (editingSlot) {
        await api.patch(`/availability/${editingSlot._id}`, payload);
      } else {
        await api.post('/availability', payload);
      }

      setModalOpen(false);
      fetchSlots();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to save slot. Check for overlapping times or past dates.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (slot.status === 'booked') {
      alert('Cannot delete an availability slot that has an active student booking.');
      return;
    }

    if (!window.confirm(`Delete availability slot on ${slot.date} (${slot.startTime} - ${slot.endTime})?`)) {
      return;
    }

    try {
      await api.delete(`/availability/${slot._id}`);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Availability Slots</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish consultation slots in advance for students to book. Overlapping slots are automatically prevented.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-semibold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Availability Slot
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Status filters */}
        <div className="flex gap-2">
          {['all', 'available', 'booked', 'blocked'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-royal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Slots Table / List */}
      {loading ? (
        <LoadingSpinner text="Loading availability slots..." fullScreen />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No slots found"
          description="You have not published any availability slots matching your filter."
          actionLabel="Add First Slot"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Method & Location</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slots.map((slot) => {
                  const isBooked = slot.status === 'booked';
                  return (
                    <tr key={slot._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {slot.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          {slot.meetingMethod === 'online' ? (
                            <Video className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {slot.meetingMethod === 'online' ? 'Online' : 'In-Person'}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                          {slot.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-500 truncate">
                        {slot.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={slot.status} />
                        {isBooked && slot.currentAppointmentId?.studentId && (
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Booked by: {slot.currentAppointmentId.studentId.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {!isBooked && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(slot)}
                              className="p-1 text-slate-500 hover:text-royal-600 rounded hover:bg-slate-100"
                              title="Edit Slot"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot)}
                              className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isBooked && (
                          <span className="text-[11px] text-slate-400 italic">
                            Active Booking Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSlot ? 'Edit Availability Slot' : 'Create New Availability Slot'}
        >
          <form onSubmit={handleSubmitSlot} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Time (24h) *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Time (24h) *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Method *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMeetingMethod('in-person')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    meetingMethod === 'in-person'
                      ? 'bg-royal-50 border-royal-500 text-royal-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingMethod('online')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    meetingMethod === 'online'
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Online
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location or Online Meeting Link *
              </label>
              <input
                type="text"
                required
                placeholder={
                  meetingMethod === 'online'
                    ? 'e.g. https://meet.google.com/xyz-abc'
                    : 'e.g. Faculty Office, Room 304'
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructions or Preparation Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Bring your architecture diagram and Git commit log"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving Slot...' : editingSlot ? 'Update Slot' : 'Publish Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
