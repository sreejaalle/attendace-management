const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create users
    const users = [
      {
        name: 'John Manager',
        email: 'manager@company.com',
        password: hashedPassword,
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Operations'
      },
      {
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Carol Williams',
        email: 'carol@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Marketing'
      },
      {
        name: 'David Brown',
        email: 'david@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Sales'
      },
      {
        name: 'Eva Martinez',
        email: 'eva@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP005',
        department: 'HR'
      },
      {
        name: 'Frank Garcia',
        email: 'frank@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP006',
        department: 'Finance'
      },
      {
        name: 'Grace Lee',
        email: 'grace@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP007',
        department: 'Engineering'
      },
      {
        name: 'Henry Wilson',
        email: 'henry@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP008',
        department: 'Marketing'
      },
      {
        name: 'Ivy Chen',
        email: 'ivy@company.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP009',
        department: 'Operations'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create attendance records for the past 30 days
    const attendanceRecords = [];
    const employees = createdUsers.filter(u => u.role === 'employee');
    const statuses = ['present', 'present', 'present', 'present', 'late', 'half-day', 'absent'];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of employees) {
        // Random status with higher probability of being present
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (status === 'absent') continue;

        // Generate check-in time (8:30 AM - 10:30 AM)
        const checkInHour = status === 'present' ? 8 + Math.random() * 0.5 : 9.5 + Math.random() * 1;
        const checkInTime = new Date(date);
        checkInTime.setHours(Math.floor(checkInHour), Math.floor((checkInHour % 1) * 60), 0, 0);

        // Generate check-out time (5:00 PM - 7:00 PM)
        const checkOutHour = 17 + Math.random() * 2;
        const checkOutTime = new Date(date);
        checkOutTime.setHours(Math.floor(checkOutHour), Math.floor((checkOutHour % 1) * 60), 0, 0);

        // Calculate total hours
        const totalHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));

        attendanceRecords.push({
          userId: employee._id,
          date,
          checkInTime,
          checkOutTime,
          status: status === 'present' ? 'present' : status,
          totalHours
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nTest Credentials:');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: alice@company.com / password123');
    console.log('Employee: bob@company.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
