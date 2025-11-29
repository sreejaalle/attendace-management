const express = require('express');
const router = express.Router();
const { 
  checkIn, 
  checkOut, 
  getTodayStatus, 
  getMyHistory, 
  getMySummary,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  getTodayStatusAll,
  exportAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Employee routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/my-history', protect, getMyHistory);
router.get('/my-summary', protect, getMySummary);

// Manager routes
router.get('/all', protect, authorize('manager'), getAllAttendance);
router.get('/employee/:id', protect, authorize('manager'), getEmployeeAttendance);
router.get('/summary', protect, authorize('manager'), getTeamSummary);
router.get('/today-status', protect, authorize('manager'), getTodayStatusAll);
router.get('/export', protect, authorize('manager'), exportAttendance);

module.exports = router;
