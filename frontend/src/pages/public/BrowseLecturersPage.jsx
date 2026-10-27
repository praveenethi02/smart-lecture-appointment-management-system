import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, Filter, Building2, MapPin, Mail, ArrowRight, UserCheck } from 'lucide-react';

export default function BrowseLecturersPage() {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const [lecturersRes, deptsRes] = await Promise.all([
          api.get('/lecturers'),
          api.get('/departments'),
        ]);

        if (lecturersRes.data.success) {
          setLecturers(lecturersRes.data.lecturers);
        }
        if (deptsRes.data.success) {
          setDepartments(deptsRes.data.departments);
        }
      } catch (err) {
        console.error('Failed to load lecturers or departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/lecturers', { params });
      if (res.data.success) {
        setLecturers(res.data.lecturers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setSelectedDept('');
    setSearchTerm('');
    try {
      setLoading(true);
      const res = await api.get('/lecturers');
      if (res.data.success) {
        setLecturers(res.data.lecturers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">University Faculty & Lecturers</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse academic advisors by department, subject specialization, or research interests.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by lecturer name, specialization, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
          />
        </div>

        {/* Department select */}
        <div className="w-full md:w-72">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleFilter}
            className="flex-1 md:flex-initial px-5 py-2 text-sm font-medium text-white bg-royal-600 hover:bg-royal-700 rounded-lg shadow-sm transition-colors"
          >
            Apply
          </button>
          {(selectedDept || searchTerm) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Lecturers Grid */}
      {loading ? (
        <LoadingSpinner text="Loading faculty members..." fullScreen />
      ) : lecturers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No lecturers found"
          description="Try adjusting your department filter or search term."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lecturers.map((lecturer) => (
            <div
              key={lecturer._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {lecturer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {lecturer.name}
                    </h3>
                    <p className="text-xs text-royal-600 font-medium mt-0.5">
                      {lecturer.department?.name || 'Academic Faculty'}
                    </p>
                    <span className="inline-block mt-1 text-[11px] text-slate-500 font-mono">
                      {lecturer.employeeId || 'Faculty Member'}
                    </span>
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Specialization
                  </span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                    {lecturer.specialization || 'General Academic Guidance'}
                  </p>
                </div>

                {/* Bio */}
                {lecturer.bio && (
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {lecturer.bio}
                  </p>
                )}

                {/* Meta details */}
                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Office: {lecturer.officeLocation || 'Main Campus'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lecturer.email}</span>
                  </div>
                </div>
              </div>

              {/* View Availability Button */}
              <div className="pt-6">
                <Link
                  to={`/lecturers/${lecturer._id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>View Available Slots & Book</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
