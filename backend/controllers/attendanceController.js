const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Parser } = require('json2csv');

// Helper to get start and end of day
const getDateBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
exports.checkIn = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDateBounds(today);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: start, $lte: end }
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: start,
        checkInTime: new Date()
      });
    } else {
      attendance.checkInTime = new Date();
    }

    attendance.determineStatus();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private (Employee)
exports.checkOut = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDateBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: start, $lte: end }
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get today's status
// @route   GET /api/attendance/today
// @access  Private (Employee)
exports.getTodayStatus = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDateBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: start, $lte: end }
    });

    res.status(200).json({
      success: true,
      data: attendance || { status: 'not-checked-in' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Employee)
exports.getMyHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my monthly summary
// @route   GET /api/attendance/my-summary
// @access  Private (Employee)
exports.getMySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(2),
      month: targetMonth + 1,
      year: targetYear
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============ MANAGER ENDPOINTS ============

// @desc    Get all employees attendance
// @route   GET /api/attendance/all
// @access  Private (Manager)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status, employeeId, department, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (date) {
      const { start, end } = getDateBounds(new Date(date));
      query.date = { $gte: start, $lte: end };
    }
    
    if (status) {
      query.status = status;
    }

    // Get all attendance records with user details
    let attendanceQuery = Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Apply pagination
    const skip = (page - 1) * limit;
    attendanceQuery = attendanceQuery.skip(skip).limit(parseInt(limit));

    const attendance = await attendanceQuery;
    const total = await Attendance.countDocuments(query);

    // Filter by employee ID or department if needed (after populate)
    let filteredAttendance = attendance;
    if (employeeId) {
      filteredAttendance = attendance.filter(a => 
        a.userId && a.userId.employeeId === employeeId
      );
    }
    if (department) {
      filteredAttendance = filteredAttendance.filter(a => 
        a.userId && a.userId.department === department
      );
    }

    res.status(200).json({
      success: true,
      count: filteredAttendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: filteredAttendance
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get specific employee attendance
// @route   GET /api/attendance/employee/:id
// @access  Private (Manager)
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { userId: req.params.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get team summary
// @route   GET /api/attendance/summary
// @access  Private (Manager)
exports.getTeamSummary = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // Get all employees
    let userQuery = { role: 'employee' };
    if (department) {
      userQuery.department = department;
    }
    const employees = await User.find(userQuery);

    // Get attendance for the month
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name email employeeId department');

    // Calculate summary
    const summary = {
      totalEmployees: employees.length,
      totalPresent: attendance.filter(a => a.status === 'present').length,
      totalAbsent: attendance.filter(a => a.status === 'absent').length,
      totalLate: attendance.filter(a => a.status === 'late').length,
      totalHalfDay: attendance.filter(a => a.status === 'half-day').length,
      averageHours: (attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / (attendance.length || 1)).toFixed(2),
      month: targetMonth + 1,
      year: targetYear
    };

    // Department-wise breakdown
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const departmentSummary = departments.map(dept => {
      const deptAttendance = attendance.filter(a => a.userId && a.userId.department === dept);
      return {
        department: dept,
        present: deptAttendance.filter(a => a.status === 'present').length,
        absent: deptAttendance.filter(a => a.status === 'absent').length,
        late: deptAttendance.filter(a => a.status === 'late').length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        departmentSummary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get today's status for all employees
// @route   GET /api/attendance/today-status
// @access  Private (Manager)
exports.getTodayStatusAll = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDateBounds(today);

    const employees = await User.find({ role: 'employee' });
    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate('userId', 'name email employeeId department');

    const checkedInIds = attendance.map(a => a.userId?._id?.toString());
    
    const present = attendance.filter(a => a.checkInTime);
    const absent = employees.filter(e => !checkedInIds.includes(e._id.toString()));
    const late = attendance.filter(a => a.status === 'late');

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: employees.length,
        presentCount: present.length,
        absentCount: absent.length,
        lateCount: late.length,
        presentEmployees: present,
        absentEmployees: absent.map(e => ({
          _id: e._id,
          name: e.name,
          email: e.email,
          employeeId: e.employeeId,
          department: e.department
        })),
        lateEmployees: late
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export attendance to CSV
// @route   GET /api/attendance/export
// @access  Private (Manager)
exports.exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, department } = req.query;

    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Filter by employee or department
    let filteredAttendance = attendance;
    if (employeeId) {
      filteredAttendance = attendance.filter(a => 
        a.userId && a.userId.employeeId === employeeId
      );
    }
    if (department) {
      filteredAttendance = filteredAttendance.filter(a => 
        a.userId && a.userId.department === department
      );
    }

    // Transform data for CSV
    const csvData = filteredAttendance.map(a => ({
      'Employee ID': a.userId?.employeeId || 'N/A',
      'Name': a.userId?.name || 'N/A',
      'Department': a.userId?.department || 'N/A',
      'Date': a.date.toISOString().split('T')[0],
      'Check In': a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : 'N/A',
      'Check Out': a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : 'N/A',
      'Status': a.status,
      'Total Hours': a.totalHours || 0
    }));

    const fields = ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Total Hours'];
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
