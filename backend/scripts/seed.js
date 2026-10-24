import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';

import User from '../models/User.js';
import Department from '../models/Department.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import Setting from '../models/Setting.js';

dotenv.config();

export const seedDatabase = async (options = {}) => {
  const { keepOpen = false } = options;
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing database collections...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    await Setting.deleteMany({});

    console.log('[Seed] Seeding System Settings...');
    await Setting.create({
      universityName: 'National Apex University',
      contactEmail: 'appointments@apex.edu',
      cancellationDeadlineHours: 2,
      requireLecturerApproval: false,
      timezone: 'Asia/Colombo',
    });

    console.log('[Seed] Seeding University Departments...');
    const departments = await Department.create([
      {
        name: 'Computer Engineering',
        code: 'CE',
        description: 'Focuses on computer hardware, embedded systems, microprocessors, and distributed software architectures.',
        isActive: true,
      },
      {
        name: 'Civil Engineering',
        code: 'CIV',
        description: 'Focuses on structural design, geotechnical mechanics, transportation systems, and infrastructure engineering.',
        isActive: true,
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Focuses on thermodynamics, fluid dynamics, robotics, mechanical design, and manufacturing technologies.',
        isActive: true,
      },
      {
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Focuses on power systems, electrical machines, renewable energy, telecommunications, and signal processing.',
        isActive: true,
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d._id;
    });

    console.log('[Seed] Seeding Administrator Account...');
    const adminPassword = await User.hashPassword('Admin@123');
    await User.create({
      name: 'Dr. Arthur Pendelton (Admin)',
      email: 'admin@apex.edu',
      passwordHash: adminPassword,
      role: 'admin',
      employeeId: 'ADM-001',
      phone: '+94 11 234 5678',
      officeLocation: 'Administrative Complex, Room 102',
      isActive: true,
    });

    console.log('[Seed] Seeding Lecturer Accounts...');
    const lecturerPassword = await User.hashPassword('Lecturer@123');
    const lecturers = await User.create([
      {
        name: 'Dr. Kamal Perera',
        email: 'dr.kamal@apex.edu',
        passwordHash: lecturerPassword,
        role: 'lecturer',
        employeeId: 'LEC-101',
        department: deptMap['CE'],
        departmentName: 'Computer Engineering',
        specialization: 'Computer Systems, Embedded Computing & Cloud Architectures',
        officeLocation: 'Engineering Block A, Room 304',
        phone: '+94 77 123 4567',
        bio: 'Senior Lecturer in Computer Engineering with 12+ years of research in distributed computing, embedded systems, and high-performance computing.',
        isActive: true,
      },
      {
        name: 'Prof. Sarah Silva',
        email: 'prof.sarah@apex.edu',
        passwordHash: lecturerPassword,
        role: 'lecturer',
        employeeId: 'LEC-102',
        department: deptMap['CIV'],
        departmentName: 'Civil Engineering',
        specialization: 'Structural Engineering & Geotechnical Analysis',
        officeLocation: 'Civil Engineering Wing, 2nd Floor',
        phone: '+94 77 234 5678',
        bio: 'Professor in Civil Engineering specializing in earthquake-resistant structures, concrete materials, and sustainable infrastructure design.',
        isActive: true,
      },
      {
        name: 'Dr. Nuwan Fernando',
        email: 'dr.nuwan@apex.edu',
        passwordHash: lecturerPassword,
        role: 'lecturer',
        employeeId: 'LEC-103',
        department: deptMap['ME'],
        departmentName: 'Mechanical Engineering',
        specialization: 'Thermodynamics, Fluid Dynamics & Robotics',
        officeLocation: 'Mechanical Complex, Room 108',
        phone: '+94 77 345 6789',
        bio: 'Senior Lecturer in Mechanical Engineering guiding students in CAD/CAM modeling, thermal energy systems, and robotics automation.',
        isActive: true,
      },
      {
        name: 'Dr. Anoma Wijesinghe',
        email: 'dr.anoma@apex.edu',
        passwordHash: lecturerPassword,
        role: 'lecturer',
        employeeId: 'LEC-104',
        department: deptMap['EE'],
        departmentName: 'Electrical Engineering',
        specialization: 'Power Systems, Renewable Energy & Signal Processing',
        officeLocation: 'Electrical Labs, Room 208',
        phone: '+94 77 456 7890',
        bio: 'Expert in smart grid technologies, power electronics, and digital signal processing for modern power distribution systems.',
        isActive: true,
      },
    ]);

    console.log('[Seed] Seeding Student Accounts...');
    const studentPassword = await User.hashPassword('Student@123');
    const students = await User.create([
      {
        name: 'Kasun Mendis',
        email: 'kasun@student.apex.edu',
        passwordHash: studentPassword,
        role: 'student',
        registrationNumber: 'EG2023001',
        department: deptMap['CE'],
        departmentName: 'Computer Engineering',
        phone: '+94 71 111 2233',
        isActive: true,
      },
      {
        name: 'Dinithi Jayasinghe',
        email: 'dinithi@student.apex.edu',
        passwordHash: studentPassword,
        role: 'student',
        registrationNumber: 'EG2023002',
        department: deptMap['CIV'],
        departmentName: 'Civil Engineering',
        phone: '+94 71 222 3344',
        isActive: true,
      },
      {
        name: 'Ravindu Alwis',
        email: 'ravindu@student.apex.edu',
        passwordHash: studentPassword,
        role: 'student',
        registrationNumber: 'EG2023003',
        department: deptMap['ME'],
        departmentName: 'Mechanical Engineering',
        phone: '+94 71 333 4455',
        isActive: true,
      },
      {
        name: 'Chamari Bandara',
        email: 'chamari@student.apex.edu',
        passwordHash: studentPassword,
        role: 'student',
        registrationNumber: 'EG2023004',
        department: deptMap['EE'],
        departmentName: 'Electrical Engineering',
        phone: '+94 71 444 5566',
        isActive: true,
      },
      {
        name: 'Tharindu Senanayake',
        email: 'tharindu@student.apex.edu',
        passwordHash: studentPassword,
        role: 'student',
        registrationNumber: 'EG2023005',
        department: deptMap['CE'],
        departmentName: 'Computer Engineering',
        phone: '+94 71 555 6677',
        isActive: true,
      },
    ]);

    console.log('[Seed] Seeding Future Availability Slots...');
    // Future dates relative to current 2026-10-15
    const slotData = [
      // Dr. Kamal Perera slots (Computer Engineering)
      {
        lecturerId: lecturers[0]._id,
        date: '2026-10-16',
        startTime: '09:00',
        endTime: '09:45',
        location: 'Engineering Block A, Room 304',
        meetingMethod: 'in-person',
        notes: 'Bring your microcontroller schematics, board layout, and firmware code.',
        status: 'available',
      },
      {
        lecturerId: lecturers[0]._id,
        date: '2026-10-16',
        startTime: '10:00',
        endTime: '10:45',
        location: 'https://meet.google.com/apex-ce-guidance',
        meetingMethod: 'online',
        notes: 'Online consultation on FPGA design and RISC-V processor simulation.',
        status: 'available',
      },
      {
        lecturerId: lecturers[0]._id,
        date: '2026-10-17',
        startTime: '14:00',
        endTime: '15:00',
        location: 'Engineering Block A, Room 304',
        meetingMethod: 'in-person',
        notes: 'Final Year Project mid-evaluation consultation.',
        status: 'available',
      },
      {
        lecturerId: lecturers[0]._id,
        date: '2026-10-18',
        startTime: '11:00',
        endTime: '11:45',
        location: 'Engineering Block A, Room 304',
        meetingMethod: 'in-person',
        notes: 'Embedded Linux kernel compilation & driver debugging walkthrough.',
        status: 'available',
      },

      // Prof. Sarah Silva slots (Civil Engineering)
      {
        lecturerId: lecturers[1]._id,
        date: '2026-10-16',
        startTime: '13:30',
        endTime: '14:30',
        location: 'Civil Engineering Wing, 2nd Floor',
        meetingMethod: 'in-person',
        notes: 'Bring reinforced concrete beam shear calculations and structural drafting.',
        status: 'available',
      },
      {
        lecturerId: lecturers[1]._id,
        date: '2026-10-17',
        startTime: '10:00',
        endTime: '10:45',
        location: 'https://meet.google.com/apex-civil-research',
        meetingMethod: 'online',
        notes: 'Discussion on geotechnical soil bearing capacity and foundation design.',
        status: 'available',
      },
      {
        lecturerId: lecturers[1]._id,
        date: '2026-10-19',
        startTime: '15:00',
        endTime: '16:00',
        location: 'Civil Engineering Wing, 2nd Floor',
        meetingMethod: 'in-person',
        notes: 'Hydraulics catchment model review and flood risk analysis.',
        status: 'available',
      },

      // Dr. Nuwan Fernando slots (Mechanical Engineering)
      {
        lecturerId: lecturers[2]._id,
        date: '2026-10-16',
        startTime: '11:00',
        endTime: '11:45',
        location: 'Mechanical Complex, Room 108',
        meetingMethod: 'in-person',
        notes: 'Bring CAD assembly files and finite element stress analysis reports.',
        status: 'available',
      },
      {
        lecturerId: lecturers[2]._id,
        date: '2026-10-18',
        startTime: '14:00',
        endTime: '15:00',
        location: 'https://meet.google.com/apex-me-office',
        meetingMethod: 'online',
        notes: 'Robotic kinematics and closed-loop control system tuning.',
        status: 'available',
      },

      // Dr. Anoma Wijesinghe slots (Electrical Engineering)
      {
        lecturerId: lecturers[3]._id,
        date: '2026-10-17',
        startTime: '09:30',
        endTime: '10:30',
        location: 'Electrical Labs, Room 208',
        meetingMethod: 'in-person',
        notes: 'High-voltage grid load flow simulation and protection relay settings.',
        status: 'available',
      },
      {
        lecturerId: lecturers[3]._id,
        date: '2026-10-20',
        startTime: '13:00',
        endTime: '14:00',
        location: 'https://meet.google.com/apex-ee-power',
        meetingMethod: 'online',
        notes: 'Solar photovoltaic grid integration and harmonic distortion analysis.',
        status: 'available',
      },
    ];

    const slots = await Availability.create(slotData);

    console.log('[Seed] Seeding Sample Appointments with Different Statuses...');
    // 1. Confirmed appointment: Kasun booked Dr. Kamal's first slot (Computer Engineering)
    const app1 = await Appointment.create({
      studentId: students[0]._id,
      lecturerId: lecturers[0]._id,
      availabilityId: slots[0]._id,
      reason: 'Embedded Microcontroller DMA Interfacing',
      studentMessage: 'I need guidance on choosing between interrupt-driven I/O vs DMA for high-frequency ADC sensor readings.',
      status: 'confirmed',
      bookedAt: new Date(Date.now() - 3600 * 1000 * 2),
      confirmedAt: new Date(Date.now() - 3600 * 1000),
    });
    slots[0].status = 'booked';
    slots[0].currentAppointmentId = app1._id;
    await slots[0].save();

    // 2. Confirmed appointment: Dinithi booked Prof. Sarah's first slot (Civil Engineering)
    const app2 = await Appointment.create({
      studentId: students[1]._id,
      lecturerId: lecturers[1]._id,
      availabilityId: slots[4]._id,
      reason: 'Foundation Soil Mechanics & Settlement Analysis',
      studentMessage: 'My consolidation settlement calculations yield higher values under sustained loading across the clay stratum.',
      status: 'confirmed',
      bookedAt: new Date(Date.now() - 3600 * 1000 * 4),
      confirmedAt: new Date(Date.now() - 3600 * 1000 * 3),
    });
    slots[4].status = 'booked';
    slots[4].currentAppointmentId = app2._id;
    await slots[4].save();

    // 3. Completed past appointment
    const pastSlot = await Availability.create({
      lecturerId: lecturers[0]._id,
      date: '2026-10-14',
      startTime: '10:00',
      endTime: '10:45',
      location: 'Engineering Block A, Room 304',
      meetingMethod: 'in-person',
      notes: 'Completed session',
      status: 'booked',
    });
    const app3 = await Appointment.create({
      studentId: students[2]._id,
      lecturerId: lecturers[0]._id,
      availabilityId: pastSlot._id,
      reason: 'Pipeline Hazard Detection in MIPS Architecture',
      studentMessage: 'Clarification regarding branch prediction and forwarding logic.',
      status: 'completed',
      lecturerResponse: 'Session concluded successfully. Student was advised to implement forwarding paths before inserting stalls.',
      bookedAt: new Date(Date.now() - 86400 * 1000 * 2),
      confirmedAt: new Date(Date.now() - 86400 * 1000 * 2),
      completedAt: new Date(Date.now() - 86400 * 1000),
    });
    pastSlot.currentAppointmentId = app3._id;
    await pastSlot.save();

    // 4. Cancelled appointment
    const cancelledSlot = await Availability.create({
      lecturerId: lecturers[2]._id,
      date: '2026-10-19',
      startTime: '16:00',
      endTime: '17:00',
      location: 'Mechanical Complex, Room 108',
      meetingMethod: 'in-person',
      notes: 'Cancelled session test slot',
      status: 'available', // returned to available after cancellation
    });
    await Appointment.create({
      studentId: students[3]._id,
      lecturerId: lecturers[2]._id,
      availabilityId: cancelledSlot._id,
      reason: 'Computational Fluid Dynamics Wind Tunnel Mesh Review',
      studentMessage: 'Need assistance with boundary layer inflation layers.',
      status: 'cancelled',
      cancellationReason: 'Student had a conflicting engineering mathematics examination.',
      cancelledBy: students[3]._id,
      bookedAt: new Date(Date.now() - 86400 * 1000),
      cancelledAt: new Date(Date.now() - 3600 * 1000 * 5),
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.create([
      {
        recipientId: lecturers[0]._id,
        title: 'New Appointment Booked',
        message: 'Kasun Mendis booked an appointment for 2026-10-16 at 09:00 (Embedded Microcontroller DMA Interfacing).',
        type: 'booking_created',
        relatedAppointmentId: app1._id,
        isRead: false,
      },
      {
        recipientId: students[0]._id,
        title: 'Appointment Confirmed',
        message: 'Your appointment on 2026-10-16 at 09:00 with Dr. Kamal Perera is confirmed.',
        type: 'appointment_confirmed',
        relatedAppointmentId: app1._id,
        isRead: true,
      },
      {
        recipientId: students[1]._id,
        title: 'Appointment Confirmed',
        message: 'Your appointment on 2026-10-16 at 13:30 with Prof. Sarah Silva is confirmed.',
        type: 'appointment_confirmed',
        relatedAppointmentId: app2._id,
        isRead: false,
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS FOR LOCAL PRESENTATION:');
    console.log('Administrator: admin@apex.edu | Admin@123');
    console.log('Lecturer 1:    dr.kamal@apex.edu | Lecturer@123');
    console.log('Lecturer 2:    prof.sarah@apex.edu | Lecturer@123');
    console.log('Lecturer 3:    dr.nuwan@apex.edu | Lecturer@123');
    console.log('Student 1:     kasun@student.apex.edu | Student@123');
    console.log('Student 2:     dinithi@student.apex.edu | Student@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
  } finally {
    if (!keepOpen) {
      await closeDB();
    }
  }
};

// If executed directly from command line
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
