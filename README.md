# 🎓 Smart Lecturer Appointment Management System

A full-stack, enterprise-grade **MERN** (MongoDB, Express.js, React, Node.js) web application designed for university academic advising, research mentorship, and project guidance. 

Developed with a modern university palette (Deep Navy Blue `#0b1b2b` & Royal Blue `#2563eb`), role-based access control, atomic concurrency guarantees against double-bookings, Asia/Colombo timezone alignment, and in-app notifications.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features by User Role](#2-key-features-by-user-role)
3. [Technology Stack](#3-technology-stack)
4. [Architecture & Concurrency Protection](#4-architecture--concurrency-protection)
5. [Prerequisites](#5-prerequisites)
6. [Installation & Setup](#6-installation--setup)
7. [Environment Variables](#7-environment-variables)
8. [Database Seeding & Demo Accounts](#8-database-seeding--demo-accounts)
9. [How to Run Locally](#9-how-to-run-locally)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Automated Verification & Testing](#11-automated-verification--testing)
12. [Troubleshooting & Common Solutions](#12-troubleshooting--common-solutions)

---

## 1. Project Overview

At universities, lecturers balance intensive teaching schedules, research supervision, and administrative duties. Students often encounter friction attempting to consult lecturers for:
- Final year project (FYP) and thesis mentorship
- Assignment clarifications and coursework questions
- Academic advising and elective selection

**Smart Lecturer Appointment Management System** resolves this by enabling lecturers to publish structured consultation slots in advance. Students can inspect lecturer availability in real time, filter by department or date, and book guaranteed time slots with instant confirmation.

---

## 2. Key Features by User Role

### 👨‍🎓 Student Role
- **Self-Service Registration & Secure Login**: Students can register with institutional email, legal name, department, and student registration/index number.
- **Find Lecturers**: Search faculty by name, specialization, research keywords, and academic department.
- **Browse Real-Time Availability**: View future open slots with duration, consultation mode (*In-Person* or *Online*), and room/meeting link details.
- **Conflict-Free Booking**: Select a slot, specify appointment reason and optional message, with immediate booking confirmation.
- **My Appointments Dashboard**: Filter by status (*Confirmed*, *Pending*, *Completed*, *Cancelled*), view lecturer feedback, and inspect session details.
- **Policy-Enforced Cancellation**: Cancel appointments with an optional reason prior to the university's configurable cancellation deadline window (e.g., minimum 2-hour notice).
- **In-App Notifications**: Real-time alerts when appointments are confirmed, completed, or cancelled.
- **Student Profile**: Update contact phone, bio, and change account password securely.

### 👨‍🏫 Lecturer Role
- **Lecturer Dashboard**: Metrics on total slots published, open slots, confirmed consultations, and student requests.
- **Manage Availability**:
  - Create consultation slots specifying date, start time, end time, location/meeting URL, and student preparation notes.
  - Automatic validation preventing past-date creation.
  - Automatic server-side collision detection preventing overlapping slots for the same lecturer.
  - Edit or delete unbooked slots (locked automatically once booked by a student).
- **Consultation Schedule**: Daily and upcoming agenda with full student details (index number, email, phone, appointment reason, and context message).
- **Status Workflow**: Confirm pending requests, mark sessions as *Completed* with consultation summary notes, or cancel with explanation.
- **Notifications**: Instant alerts on new student bookings and cancellations.
- **Lecturer Profile**: Manage specialization, office location, bio, and credentials.

### 🛡️ Administrator Role
- **Institutional Metrics Dashboard**: Real-time KPI cards for total students, faculty members, total bookings, pending approvals, and completed consultations.
- **Student Management**: View student registry, search by index number, edit details, and activate or deactivate student accounts.
- **Faculty Management**: Provision verified lecturer accounts with employee IDs, departments, specializations, and offices.
- **Department Administration**: Create and configure academic faculties and department codes (e.g., CE, CIV, ME, EE).
- **Central Appointment Registry**: Full audit trail of all university consultations with filtering by date, status, student, and faculty.
- **System Settings & Policies**: Configure university name, support email, student cancellation deadline hours, and toggle mandatory lecturer confirmation.

---

## 3. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18 & Vite | Fast ES-module development and production bundling |
| **Styling** | Tailwind CSS | Custom university navy and royal blue palette, accessible contrast |
| **Icons** | Lucide React | Clean, professional icon set |
| **HTTP Client**| Axios | Interceptors for Bearer token injection and 401 handling |
| **Routing** | React Router v6 | Role-based protected routes, dashboard navigation, and 404 handler |
| **Backend** | Node.js & Express.js | Modular RESTful architecture with ES Modules (`"type": "module"`) |
| **Database** | MongoDB Atlas / Local | Managed cloud MongoDB with Mongoose ODM |
| **Zero-Config DB**| MongoDB Memory Server | Out-of-the-box in-memory fallback for local demonstration without external setup |
| **Authentication**| JWT & bcryptjs | 7-day signed tokens with salted bcrypt password hashing |
| **Timezone** | Asia/Colombo | Consistently handled via ISO UTC+05:30 offsets |

---

## 4. Architecture & Concurrency Protection

### Double-Booking Prevention
To ensure two students can never book the same availability slot concurrently:
1. The backend uses an **atomic conditional update** in MongoDB:
   ```javascript
   const updatedSlot = await Availability.findOneAndUpdate(
     { _id: availabilityId, status: 'available' },
     { $set: { status: 'booked' } },
     { new: true }
   );
   ```
2. If `updatedSlot` is `null`, another concurrent request has already reserved the slot. The server safely rejects the second request with `409 Conflict`.
3. An active student is also checked to prevent duplicate appointments for the same slot.

### Past-Date & Overlap Enforcement
- Time slot start times are verified against the current university time in `Asia/Colombo`. Any past slot is rejected (`400 Bad Request`).
- When a lecturer adds or edits a slot, existing slots for that lecturer on the target date are checked using interval intersection:
  $$\max(\text{start}_A, \text{start}_B) < \min(\text{end}_A, \text{end}_B)$$
  Any overlap results in a clear error message identifying the conflicting time window.

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher (v24+ tested)
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas connection string (or local MongoDB). If neither is configured, the backend automatically boots an internal in-memory instance for testing!

---

## 6. Installation & Setup

Clone the repository and install dependencies for both the frontend and backend:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

---

## 7. Environment Variables

### Backend Configuration (`backend/.env`)

A default `.env` file is prepared. To connect to MongoDB Atlas, update `MONGODB_URI`:

```env
PORT=5000
NODE_ENV=development
# Replace with your MongoDB Atlas cluster URI if using Atlas:
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/university_appointments?retryWrites=true&w=majority
JWT_SECRET=uni_appointment_system_dev_secret_key_2026_xyz
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TIMEZONE=Asia/Colombo
CANCELLATION_DEADLINE_HOURS=2
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=/api
```

*(Requests to `/api` are automatically proxied to `http://localhost:5000` via Vite)*.

---

## 8. Database Seeding & Demo Accounts

To populate the database with university departments, faculty members, students, future availability slots, and sample appointments:

```bash
cd backend
npm run seed
```

> **Note**: In development mode, if the database is detected as empty upon server start, it will automatically run the seed script so you can test immediately.

### 🔑 Verified Demo Credentials

| Role | Email | Password | Name & Faculty |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@apex.edu` | `Admin@123` | Dr. Arthur Pendelton (Admin Complex) |
| **Lecturer 1** | `dr.kamal@apex.edu` | `Lecturer@123` | Dr. Kamal Perera (Computer Engineering) |
| **Lecturer 2** | `prof.sarah@apex.edu` | `Lecturer@123` | Prof. Sarah Silva (Civil Engineering) |
| **Lecturer 3** | `dr.nuwan@apex.edu` | `Lecturer@123` | Dr. Nuwan Fernando (Mechanical Engineering) |
| **Student 1** | `kasun@student.apex.edu` | `Student@123` | Kasun Mendis (EG2023001 - Computer Eng.) |
| **Student 2** | `dinithi@student.apex.edu` | `Student@123` | Dinithi Jayasinghe (EG2023002 - Civil Eng.) |

*(Quick 1-click login buttons are also built directly into the Login page for instant demonstration).*

---

## 9. How to Run Locally

### Option A: Running with npm Scripts from Project Root

From the `g:\WebDevelopment` root directory:

```bash
# Terminal 1: Start Backend API
npm run backend

# Terminal 2: Start Frontend Application
npm run frontend
```

### Option B: Running Separately

```bash
# Terminal 1 - Backend:
cd backend
npm start
# Server listens at http://localhost:5000

# Terminal 2 - Frontend:
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 10. REST API Documentation

### Authentication & Profile (`/api/auth`)
- `POST /api/auth/register` - Public student registration (role escalation strictly blocked).
- `POST /api/auth/login` - Authenticate user, verify active status, return JWT and profile.
- `POST /api/auth/logout` - Clear session token.
- `GET /api/auth/me` - Fetch authenticated user profile.
- `PATCH /api/auth/profile` - Update profile name, phone, bio, or office location.
- `PATCH /api/auth/change-password` - Verify current password and update with hashed new password.

### Faculty Discovery (`/api/lecturers`)
- `GET /api/lecturers` - List active lecturers with search and department filtering.
- `GET /api/lecturers/:id` - Get lecturer profile and department information.
- `GET /api/lecturers/:id/availability` - List upcoming available slots for a lecturer.

### Availability Management (`/api/availability`)
- `GET /api/availability` - Retrieve lecturer's own availability slots.
- `POST /api/availability` - Create a future slot (checks for past dates and overlapping slots).
- `PATCH /api/availability/:id` - Edit an unbooked slot.
- `DELETE /api/availability/:id` - Delete an unbooked slot.

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Book a slot (atomic concurrency lock to prevent double bookings).
- `GET /api/appointments/my` - Get authenticated user's appointments (student or lecturer).
- `GET /api/appointments/:id` - Get appointment details (ownership verified).
- `PATCH /api/appointments/:id/status` - Update status (`confirmed`, `rejected`, `completed`).
- `PATCH /api/appointments/:id/cancel` - Cancel appointment with reason (validates cancellation deadline).

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user's notifications and unread counter.
- `PATCH /api/notifications/:id/read` - Mark single notification as read.
- `PATCH /api/notifications/read-all` - Mark all notifications as read.

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` - University statistics and recent booking activity.
- `GET /api/admin/users` - Search and paginate student and lecturer accounts.
- `POST /api/admin/users` - Provision lecturer or student accounts.
- `PATCH /api/admin/users/:id` - Update user information.
- `PATCH /api/admin/users/:id/status` - Activate or deactivate user accounts.
- `GET /api/admin/departments` - List all departments.
- `POST /api/admin/departments` - Create new department.
- `PATCH /api/admin/departments/:id` - Update department details and status.
- `GET /api/admin/appointments` - Comprehensive audit log of all appointments.
- `GET /api/admin/settings` - Retrieve institutional settings.
- `PATCH /api/admin/settings` - Update cancellation deadlines and approval policies.

---

## 11. Automated Verification & Testing

An automated end-to-end test suite is included in `backend/scripts/test-api.js` testing 16 critical requirements:

```bash
cd backend
npm run test
```

### Verified Test Cases:
1. Student registration & JWT token generation.
2. Prevention of public admin/lecturer account escalation.
3. Lecturer login with role authorization.
4. Administrator login with role authorization.
5. Student login with role authorization.
6. Role-Based Access Control (preventing students from accessing admin routes).
7. Rejection of availability slots in past dates or times.
8. Creation of valid future availability slots.
9. Rejection of overlapping time slots for the same lecturer.
10. Successful appointment booking for an available future slot.
11. Concurrency safety & atomic double-booking rejection (`409 Conflict`).
12. In-app notifications generated for lecturer upon student booking.
13. Lecturer appointment completion workflow with session feedback.
14. Administrative dashboard statistics calculation.
15. Administrator user activation & deactivation controls.
16. Immediate rejection of login attempts for deactivated accounts (`403 Forbidden`).

---

## 12. Troubleshooting & Common Solutions

1. **Port 5000 or 5173 already in use**:
   - Check which process is occupying the port using `Get-NetTCPConnection -LocalPort 5000` or `5173` and terminate it, or change `PORT` in `backend/.env`.
2. **MongoDB Connection Warning**:
   - If `MONGODB_URI` is not reachable, the system will automatically fall back to an internal in-memory MongoDB instance so you can continue demonstrating without interruption.
3. **CORS issues**:
   - Ensure `CLIENT_URL=http://localhost:5173` is present in `backend/.env`. In development mode, CORS is configured to accept requests from both `localhost` and `127.0.0.1`.
4. **Vite Proxy**:
   - Ensure the backend server is running on port 5000 before initiating frontend requests through `/api`.

---

## 🎓 Academic Integrity & Production Readiness

Built with secure password hashing (`bcryptjs`), role-based authorization guards, rate-limiting on authentication endpoints, responsive design across mobile/tablet/desktop, and maintainable modular architecture.
