const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');
const Department = require('./models/Department');

const MONGO_URI = 'mongodb://localhost:27017/leave-tracker';

const createTestLeaves = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find ALL departments first to see what exists
    const allDepts = await Department.find({});
    console.log('All departments in database:', allDepts.map(d => ({ name: d.name, id: d._id })));

    // Find CSE department
    const cseDept = await Department.findOne({ name: 'CSE' });
    if (!cseDept) {
      console.log('CSE department not found. Available departments:', allDepts.map(d => d.name).join(', '));
      return;
    }

    console.log('CSE Department found:', cseDept._id);

    // Get 8 random CSE employees (excluding HR)
    const cseEmployees = await User.find({ 
      department: cseDept._id,
      roles: { $in: ['Employee'] },
      email: { $ne: 'wahidazhar@iut-dhaka.edu' }
    }).limit(8);

    console.log(`Found ${cseEmployees.length} CSE employees`);

    const leaveTypes = ['Annual', 'Casual'];
    const statuses = ['Approved', 'Approved', 'Approved', 'Pending']; // 75% approved
    const reasons = [
      'Personal work',
      'Family matters',
      'Medical checkup',
      'Attending conference',
      'Personal commitment',
      'Family function'
    ];

    const startDate = new Date('2026-01-20');
    const endDate = new Date('2026-01-30');
    const daysRequested = 11; // Jan 20-30 inclusive

    let createdCount = 0;

    for (let i = 0; i < cseEmployees.length; i++) {
      const employee = cseEmployees[i];
      const leaveType = leaveTypes[i % 2]; // Alternate between Annual and Casual
      const status = statuses[i % 4]; // Mix of approved and pending
      const reason = reasons[i % reasons.length];

      // Check if employee has enough leave balance
      const balanceField = leaveType === 'Annual' ? 'annualLeaveBalance' : 'casualLeaveBalance';
      
      if (employee[balanceField] < daysRequested) {
        console.log(`Skipping ${employee.name} - insufficient ${leaveType} leave balance`);
        continue;
      }

      // Create leave application
      const leave = new LeaveRequest({
        employee: employee._id,
        department: cseDept._id,
        departmentName: 'CSE',
        applicantName: employee.name,
        applicantDesignation: employee.designation,
        applicationDate: new Date('2026-01-15'),
        startDate: startDate,
        endDate: endDate,
        numberOfDays: daysRequested,
        type: leaveType,
        reason: reason,
        status: status,
        approvedByHoD: status === 'Approved',
        approvedByHR: status === 'Approved',
        alternateEmployees: []
      });

      await leave.save();

      // Update employee balance only if approved
      if (status === 'Approved') {
        employee[balanceField] -= daysRequested;
        await employee.save();
        console.log(`✓ Created ${status} ${leaveType} leave for ${employee.name} (Balance: ${employee[balanceField]} remaining)`);
      } else {
        console.log(`✓ Created ${status} ${leaveType} leave for ${employee.name} (Balance unchanged)`);
      }

      createdCount++;
    }

    console.log(`\nSuccessfully created ${createdCount} test leave applications`);
    console.log('Date range: January 20-30, 2026 (11 days)');

  } catch (error) {
    console.error('Error creating test leaves:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createTestLeaves();
