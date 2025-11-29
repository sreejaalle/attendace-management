const express = require('express');
const router = express.Router();
const { 
  getEmployeeDashboard, 
  getManagerDashboard,
  getAllEmployees
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/employee', protect, getEmployeeDashboard);
router.get('/manager', protect, authorize('manager'), getManagerDashboard);
router.get('/employees', protect, authorize('manager'), getAllEmployees);

module.exports = router;
