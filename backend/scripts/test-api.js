import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from './seed.js';

import authRoutes from '../routes/authRoutes.js';
import departmentRoutes from '../routes/departmentRoutes.js';
import lecturerRoutes from '../routes/lecturerRoutes.js';
import availabilityRoutes from '../routes/availabilityRoutes.js';
import appointmentRoutes from '../routes/appointmentRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import { errorHandler } from '../middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

const TEST_PORT = 5005;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

const runTests = async () => {
  console.log('🧪 Starting Automated End-to-End API Test Suite...');
  await connectDB();
  await seedDatabase({ keepOpen: true });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`[Test Server] Listening on port ${TEST_PORT}`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail}`);
      failed++;
    }
  };

  try {
    // 1. Student Registration
    console.log('\n--- 1. Testing Authentication & Authorization ---');
    const studentRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Test Student',
        email: 'teststudent@student.apex.edu',
        password: 'Password@123',
        registrationNumber: 'IT2024999',
      }),
    });
    const studentRegData = await studentRegRes.json();
    assert(studentRegRes.status === 201 && studentRegData.token, 'Student Registration succeeds and issues JWT');

    // 2. Prevent Public Admin Registration
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker',
        email: 'hacker@apex.edu',
        password: 'Password@123',
        role: 'admin',
      }),
    });
    assert(adminRegRes.status === 403, 'Public registration blocks unauthorized role escalation (admin/lecturer)');

    // 3. Lecturer Login
    const lecturerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dr.kamal@apex.edu',
        password: 'Lecturer@123',
      }),
    });
    const lecturerLoginData = await lecturerLoginRes.json();
    const lecturerToken = lecturerLoginData.token;
    assert(lecturerLoginRes.status === 200 && lecturerLoginData.user.role === 'lecturer', 'Lecturer login succeeds with role check');

    // 4. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@apex.edu',
        password: 'Admin@123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    assert(adminLoginRes.status === 200 && adminLoginData.user.role === 'admin', 'Admin login succeeds with role check');

    // 5. Student Login
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kasun@student.apex.edu',
        password: 'Student@123',
      }),
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.token;
    assert(studentLoginRes.status === 200 && studentLoginData.user.role === 'student', 'Student login succeeds');

    // 6. Role-Based Access Control: Student cannot access admin routes
    console.log('\n--- 2. Testing Role-Based Access Control ---');
    const adminRouteRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(adminRouteRes.status === 403, 'Student is forbidden (403) from accessing admin routes');

    // 7. Lecturer Availability Management & Overlap Validation
    console.log('\n--- 3. Testing Availability & Overlap Validation ---');
    // Reject Past Date Slot
    const pastSlotRes = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lecturerToken}`,
      },
      body: JSON.stringify({
        date: '2020-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: 'Lab 1',
      }),
    });
    assert(pastSlotRes.status === 400, 'Rejects availability slot for past date/time');

    // Create Future Valid Slot
    const createSlotRes = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lecturerToken}`,
      },
      body: JSON.stringify({
        date: '2026-10-25',
        startTime: '14:00',
        endTime: '15:00',
        location: 'Research Lab 402',
        meetingMethod: 'in-person',
        notes: 'Discussion on distributed consensus',
      }),
    });
    const createSlotData = await createSlotRes.json();
    assert(createSlotRes.status === 201 && createSlotData.slot._id, 'Lecturer successfully creates future availability slot');
    const newSlotId = createSlotData.slot?._id;

    // Overlapping Slot Check: try overlapping 14:30 - 15:30 on same day
    const overlapSlotRes = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lecturerToken}`,
      },
      body: JSON.stringify({
        date: '2026-10-25',
        startTime: '14:30',
        endTime: '15:30',
        location: 'Research Lab 402',
      }),
    });
    assert(overlapSlotRes.status === 400, 'Rejects overlapping availability slot for the same lecturer');

    // 8. Appointment Booking & Double-Booking / Concurrency Safety
    console.log('\n--- 4. Testing Appointment Booking & Concurrency Safety ---');
    const bookRes1 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        availabilityId: newSlotId,
        reason: 'Consensus Protocols Evaluation',
        studentMessage: 'Need advice on Raft vs PBFT implementation.',
      }),
    });
    const bookData1 = await bookRes1.json();
    assert(bookRes1.status === 201 && bookData1.appointment, 'Student books available future slot successfully');
    const appointmentId = bookData1.appointment?._id;

    // Attempt double-booking same slot with another student
    const dinithiLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dinithi@student.apex.edu',
        password: 'Student@123',
      }),
    });
    const dinithiToken = (await dinithiLoginRes.json()).token;

    const bookRes2 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dinithiToken}`,
      },
      body: JSON.stringify({
        availabilityId: newSlotId,
        reason: 'Double booking test',
      }),
    });
    assert(bookRes2.status === 409 || bookRes2.status === 400, 'Prevents double-booking: returns 409 Conflict when slot is already booked');

    // 9. Notifications
    console.log('\n--- 5. Testing In-App Notifications ---');
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${lecturerToken}` },
    });
    const notifData = await notifRes.json();
    assert(notifRes.status === 200 && notifData.notifications.length > 0, 'Lecturer receives in-app notification when appointment is booked');

    // 10. Status Workflow (Lecturer marks completed)
    console.log('\n--- 6. Testing Appointment Status Updates & History ---');
    const completeRes = await fetch(`${BASE_URL}/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lecturerToken}`,
      },
      body: JSON.stringify({
        status: 'completed',
        lecturerResponse: 'Great discussion on distributed consensus.',
      }),
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200 && completeData.appointment.status === 'completed', 'Lecturer marks appointment as completed');

    // 11. Admin Dashboard & User Management
    console.log('\n--- 7. Testing Administrator Management & Metrics ---');
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.stats.totalStudents >= 5, 'Admin dashboard returns university statistics');

    // Admin Deactivate User
    const studentUser = (await (await fetch(`${BASE_URL}/admin/users?search=teststudent`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })).json()).users[0];

    const toggleRes = await fetch(`${BASE_URL}/admin/users/${studentUser._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isActive: false }),
    });
    assert(toggleRes.status === 200, 'Admin can activate/deactivate user accounts');

    // Deactivated user cannot login
    const deactLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@student.apex.edu',
        password: 'Password@123',
      }),
    });
    assert(deactLoginRes.status === 403, 'Deactivated account cannot log in');

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    await closeDB();
  }
};

runTests();
