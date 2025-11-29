const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get start and end of day
const getDateBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const today = new Date();
    const { start: todayStart, end: todayEnd } = getDateBounds(today);

    // Get current month bounds
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // This month's attendance
    const monthAttendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    // Last 7 days attendance
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: sevenDaysAgo, $lte: todayEnd }
    }).sort({ date: -1 });

    // Calculate stats
    const stats = {
      today: {
        status: todayAttendance ? 
          (todayAttendance.checkInTime ? 'checked-in' : 'not-checked-in') : 
          'not-checked-in',
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        totalHours: todayAttendance?.totalHours || 0
      },
      thisMonth: {
        present: monthAttendance.filter(a => a.status === 'present').length,
        absent: monthAttendance.filter(a => a.status === 'absent').length,
        late: monthAttendance.filter(a => a.status === 'late').length,
        halfDay: monthAttendance.filter(a => a.status === 'half-day').length,
        totalHours: monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(2),
        totalDays: monthAttendance.length
      },
      recentAttendance: recentAttendance.map(a => ({
        date: a.date,
        status: a.status,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        totalHours: a.totalHours
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
exports.getManagerDashboard = async (req, res) => {
  try {
    const today = new Date();
    const { start: todayStart, end: todayEnd } = getDateBounds(today);

    // Get all employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('userId', 'name email employeeId department');

    const presentToday = todayAttendance.filter(a => a.checkInTime).length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;
    const absentToday = totalEmployees - presentToday;

    // Get absent employees today
    const checkedInUserIds = todayAttendance
      .filter(a => a.checkInTime)
      .map(a => a.userId?._id?.toString());
    
    const allEmployees = await User.find({ role: 'employee' });
    const absentEmployees = allEmployees.filter(e => 
      !checkedInUserIds.includes(e._id.toString())
    );

    // Weekly attendance trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const { start, end } = getDateBounds(date);
      
      const dayAttendance = await Attendance.countDocuments({
        date: { $gte: start, $lte: end },
        checkInTime: { $ne: null }
      });
      
      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        present: dayAttendance
      });
    }

    // Department-wise attendance for today
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const departmentStats = await Promise.all(departments.map(async (dept) => {
      const deptEmployees = await User.countDocuments({ role: 'employee', department: dept });
      const deptPresent = todayAttendance.filter(a => 
        a.userId?.department === dept && a.checkInTime
      ).length;
      
      return {
        department: dept,
        total: deptEmployees,
        present: deptPresent,
        absent: deptEmployees - deptPresent
      };
    }));

    // Get late arrivals today
    const lateArrivals = todayAttendance
      .filter(a => a.status === 'late')
      .map(a => ({
        name: a.userId?.name,
        employeeId: a.userId?.employeeId,
        department: a.userId?.department,
        checkInTime: a.checkInTime
      }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          presentToday,
          absentToday,
          lateToday
        },
        absentEmployees: absentEmployees.map(e => ({
          name: e.name,
          employeeId: e.employeeId,
          department: e.department
        })),
        lateArrivals,
        weeklyTrend,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all employees list
// @route   GET /api/dashboard/employees
// @access  Private (Manager)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .sort({ employeeId: 1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
