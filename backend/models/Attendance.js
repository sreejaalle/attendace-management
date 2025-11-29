const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create compound index for user and date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  next();
});

// Determine status based on check-in time
attendanceSchema.methods.determineStatus = function(standardCheckInTime = '09:00') {
  if (!this.checkInTime) {
    this.status = 'absent';
    return;
  }
  
  const checkInHour = this.checkInTime.getHours();
  const checkInMinute = this.checkInTime.getMinutes();
  const [standardHour, standardMinute] = standardCheckInTime.split(':').map(Number);
  
  const checkInTotalMinutes = checkInHour * 60 + checkInMinute;
  const standardTotalMinutes = standardHour * 60 + standardMinute;
  
  // Grace period of 15 minutes
  if (checkInTotalMinutes <= standardTotalMinutes + 15) {
    this.status = 'present';
  } else if (checkInTotalMinutes <= standardTotalMinutes + 120) {
    this.status = 'late';
  } else {
    this.status = 'half-day';
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
