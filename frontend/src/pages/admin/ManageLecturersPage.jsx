import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  UserX,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
} from 'lucide-react';

export default function ManageLecturersPage() {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const params = { role: 'lecturer', limit: 100 };
      if (searchTerm) params.search = searchTerm;
      if (selectedDept) params.department = selectedDept;
      if (statusFilter !== '') params.isActive = statusFilter;

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setLecturers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.departments);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchLecturers();
  }, [selectedDept, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingLecturer(null);
    setName('');
    setEmail('');
    setPassword('Lecturer@123');
    setEmployeeId('');
    setDepartment(departments[0]?._id || '');
    setSpecialization('');
    setOfficeLocation('Faculty Office');
    setPhone('');
    setBio('');
    setIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (lec) => {
    setEditingLecturer(lec);
    setName(lec.name);
    setEmail(lec.email);
    setPassword('');
    setEmployeeId(lec.employeeId || '');
    setDepartment(lec.department?._id || lec.department || '');
    setSpecialization(lec.specialization || '');
    setOfficeLocation(lec.officeLocation || '');
    setPhone(lec.phone || '');
    setBio(lec.bio || '');
    setIsActive(lec.isActive);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError('');

      if (editingLecturer) {
        const payload = {
          name,
          employeeId,
          department,
          specialization,
          officeLocation,
          phone,
          bio,
          isActive,
        };
        if (password) payload.password = password;
        await api.patch(`/admin/users/${editingLecturer._id}`, payload);
      } else {
        await api.post('/admin/users', {
          name,
          email,
          password,
          role: 'lecturer',
          employeeId,
          department,
          specialization,
          officeLocation,
          phone,
          bio,
        });
      }

      setModalOpen(false);
      fetchLecturers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save lecturer profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (lec) => {
    try {
      await api.patch(`/admin/users/${lec._id}/status`, {
        isActive: !lec.isActive,
      });
      fetchLecturers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Faculty Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision and configure academic staff profiles, department assignments, and credentials
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-semibold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by lecturer name, specialization, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLecturers()}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
          />
        </div>

        <div className="w-full md:w-60">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>

        <button
          onClick={fetchLecturers}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors w-full md:w-auto"
        >
          Filter
        </button>
      </div>

      {/* Lecturers Table */}
      {loading ? (
        <LoadingSpinner text="Loading faculty members..." fullScreen />
      ) : lecturers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No lecturers found"
          description="Try adjusting your search criteria or add a new faculty account."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department & Office</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lecturers.map((lec) => (
                  <tr key={lec._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {lec.name}
                      <span className="block font-normal text-[11px] text-slate-500">
                        {lec.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {lec.employeeId || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold block text-slate-800">
                        {lec.department?.name || 'General Faculty'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {lec.officeLocation || 'Main Campus'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {lec.specialization || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          lec.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            lec.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {lec.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(lec)}
                        className="p-1 text-slate-500 hover:text-royal-600 rounded hover:bg-slate-100"
                        title="Edit Lecturer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(lec)}
                        className={`p-1 rounded hover:bg-slate-100 ${
                          lec.isActive
                            ? 'text-slate-400 hover:text-rose-600'
                            : 'text-slate-400 hover:text-emerald-600'
                        }`}
                        title={lec.isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {lec.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
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
          title={editingLecturer ? 'Edit Faculty Member' : 'Provision New Faculty Account'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LEC-105"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            {!editingLecturer && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="lecturer@apex.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {editingLecturer ? 'Reset Password (optional)' : 'Initial Password *'}
              </label>
              <input
                type="password"
                required={!editingLecturer}
                placeholder={editingLecturer ? 'Leave blank to keep unchanged' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI & NLP"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building B, Room 204"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Faculty Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            {editingLecturer && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveLec"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-royal-600 focus:ring-royal-500"
                />
                <label htmlFor="isActiveLec" className="text-xs font-medium text-slate-700">
                  Account is Active
                </label>
              </div>
            )}

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
                {saving ? 'Saving...' : editingLecturer ? 'Update Member' : 'Provision Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
