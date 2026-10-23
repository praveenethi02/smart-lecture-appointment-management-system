import User from '../models/User.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import Setting from '../models/Setting.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const totalAvailabilitySlots = await Availability.countDocuments();
    const availableSlots = await Availability.countDocuments({ status: 'available' });

    // Recent 10 appointments
    const recentAppointments = await Appointment.find()
      .populate('studentId', 'name email registrationNumber')
      .populate('lecturerId', 'name email department')
      .populate('availabilityId')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalLecturers,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        totalAvailabilitySlots,
        availableSlots,
      },
      recentAppointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search, isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { registrationNumber: searchRegex },
        { employeeId: searchRegex },
        { specialization: searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name code')
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      registrationNumber,
      employeeId,
      specialization,
      officeLocation,
      phone,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      department: department || null,
      registrationNumber: registrationNumber || '',
      employeeId: employeeId || '',
      specialization: specialization || '',
      officeLocation: officeLocation || '',
      phone: phone || '',
      isActive: true,
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      department,
      registrationNumber,
      employeeId,
      specialization,
      officeLocation,
      phone,
      bio,
      isActive,
      password,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department || null;
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (specialization !== undefined) user.specialization = specialization;
    if (officeLocation !== undefined) user.officeLocation = officeLocation;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (isActive !== undefined) user.isActive = isActive;

    if (password && password.length >= 6) {
      user.passwordHash = await User.hashPassword(password);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating own admin account
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own administrator account',
      });
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Department Management
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required',
      });
    }

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: 'A department with this code already exists',
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// All Appointments Management for Admin
export const getAllAppointments = async (req, res, next) => {
  try {
    const { status, date, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('lecturerId', 'name email department specialization')
      .populate('studentId', 'name email registrationNumber phone')
      .populate('availabilityId')
      .sort({ createdAt: -1 });

    let filtered = appointments;

    if (date) {
      filtered = filtered.filter(
        (app) => app.availabilityId && app.availabilityId.date === date
      );
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filtered = filtered.filter(
        (app) =>
          (app.studentId && searchRegex.test(app.studentId.name)) ||
          (app.studentId && searchRegex.test(app.studentId.email)) ||
          (app.lecturerId && searchRegex.test(app.lecturerId.name)) ||
          searchRegex.test(app.reason)
      );
    }

    const total = filtered.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      appointments: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// System Settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const {
      universityName,
      contactEmail,
      cancellationDeadlineHours,
      requireLecturerApproval,
    } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    if (universityName) settings.universityName = universityName;
    if (contactEmail) settings.contactEmail = contactEmail;
    if (cancellationDeadlineHours !== undefined) {
      settings.cancellationDeadlineHours = Number(cancellationDeadlineHours);
    }
    if (requireLecturerApproval !== undefined) {
      settings.requireLecturerApproval = Boolean(requireLecturerApproval);
    }

    await settings.save();

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
