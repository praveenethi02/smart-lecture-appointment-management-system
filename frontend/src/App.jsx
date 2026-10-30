import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import BrowseLecturersPage from './pages/public/BrowseLecturersPage';
import LecturerProfilePage from './pages/public/LecturerProfilePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Common Authenticated Pages
import NotificationsPage from './pages/common/NotificationsPage';
import ProfilePage from './pages/common/ProfilePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyAppointmentsPage from './pages/student/MyAppointmentsPage';

// Lecturer Pages
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import ManageAvailabilityPage from './pages/lecturer/ManageAvailabilityPage';
import LecturerSchedulePage from './pages/lecturer/LecturerSchedulePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import ManageLecturersPage from './pages/admin/ManageLecturersPage';
import ManageDepartmentsPage from './pages/admin/ManageDepartmentsPage';
import AllAppointmentsPage from './pages/admin/AllAppointmentsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/lecturers" element={<BrowseLecturersPage />} />
              <Route path="/lecturers/:id" element={<LecturerProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="appointments" element={<MyAppointmentsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Lecturer Protected Routes */}
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/lecturer/dashboard" replace />} />
              <Route path="dashboard" element={<LecturerDashboard />} />
              <Route path="availability" element={<ManageAvailabilityPage />} />
              <Route path="schedule" element={<LecturerSchedulePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Administrator Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<ManageStudentsPage />} />
              <Route path="lecturers" element={<ManageLecturersPage />} />
              <Route path="departments" element={<ManageDepartmentsPage />} />
              <Route path="appointments" element={<AllAppointmentsPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
