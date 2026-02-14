const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const Department = require("../models/Department");

/**
 * Get HoD analytics data (monthly and yearly for their department)
 */
const getHoDAnalytics = async (req, res) => {
    try {
        const { period = 'monthly', year, month } = req.query;

        const currentUser = await User.findById(req.user.id).populate('department');
        if (!currentUser || !currentUser.hasRole('HoD')) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const departmentId = currentUser.department._id;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

        let startDate, endDate;

        if (period === 'monthly') {
            // Monthly analytics
            startDate = new Date(currentYear, currentMonth - 1, 1);
            endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        } else {
            // Yearly analytics
            startDate = new Date(currentYear, 0, 1);
            endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        }

        // Get all leave requests for the department in the period
        const leaveRequests = await LeaveRequest.find({
            department: departmentId,
            applicationDate: { $gte: startDate, $lte: endDate }
        }).populate('employee', 'name email designation');

        // Calculate statistics
        const stats = {
            totalRequests: leaveRequests.length,
            approved: leaveRequests.filter(req => req.status === 'Approved').length,
            declined: leaveRequests.filter(req => req.status === 'Declined').length,
            pending: leaveRequests.filter(req => req.status === 'Pending').length,

            // Leave type breakdown
            annual: leaveRequests.filter(req => req.type.toLowerCase() === 'annual').length,
            casual: leaveRequests.filter(req => req.type.toLowerCase() === 'casual').length,

            // Total days
            totalDays: leaveRequests.reduce((sum, req) => sum + (req.numberOfDays || 0), 0),
            approvedDays: leaveRequests
                .filter(req => req.status === 'Approved')
                .reduce((sum, req) => sum + (req.numberOfDays || 0), 0),
        };

        // Monthly breakdown for yearly view
        let monthlyBreakdown = [];
        if (period === 'yearly') {
            monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
                const monthStart = new Date(currentYear, i, 1);
                const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

                const monthRequests = leaveRequests.filter(req => {
                    const appDate = new Date(req.applicationDate);
                    return appDate >= monthStart && appDate <= monthEnd;
                });

                return {
                    month: i + 1,
                    monthName: monthStart.toLocaleString('default', { month: 'short' }),
                    total: monthRequests.length,
                    approved: monthRequests.filter(r => r.status === 'Approved').length,
                    declined: monthRequests.filter(r => r.status === 'Declined').length,
                    pending: monthRequests.filter(r => r.status === 'Pending').length,
                    days: monthRequests.reduce((sum, r) => sum + (r.numberOfDays || 0), 0)
                };
            });
        }

        // Employee-wise breakdown
        const employeeStats = {};
        leaveRequests.forEach(req => {
            const empId = req.employee._id.toString();
            if (!employeeStats[empId]) {
                employeeStats[empId] = {
                    employeeId: empId,
                    name: req.employee.name,
                    designation: req.employee.designation,
                    totalRequests: 0,
                    approvedRequests: 0,
                    totalDays: 0,
                    approvedDays: 0
                };
            }
            employeeStats[empId].totalRequests++;
            employeeStats[empId].totalDays += req.numberOfDays || 0;
            if (req.status === 'Approved') {
                employeeStats[empId].approvedRequests++;
                employeeStats[empId].approvedDays += req.numberOfDays || 0;
            }
        });

        const topEmployees = Object.values(employeeStats)
            .sort((a, b) => b.approvedDays - a.approvedDays)
            .slice(0, 10);

        res.json({
            period,
            year: currentYear,
            month: period === 'monthly' ? currentMonth : null,
            department: currentUser.department.name,
            stats,
            monthlyBreakdown,
            topEmployees,
            recentRequests: leaveRequests
                .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
                .slice(0, 10)
                .map(req => ({
                    id: req._id,
                    employeeName: req.employee.name,
                    designation: req.employee.designation,
                    type: req.type,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    numberOfDays: req.numberOfDays,
                    status: req.status,
                    applicationDate: req.applicationDate
                }))
        });
    } catch (error) {
        console.error("Get HoD analytics error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get HR analytics data (all departments combined and individual)
 */
const getHRAnalytics = async (req, res) => {
    try {
        const { period = 'monthly', year, month, departmentId } = req.query;

        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !currentUser.hasRole('HR')) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

        let startDate, endDate;

        if (period === 'monthly') {
            startDate = new Date(currentYear, currentMonth - 1, 1);
            endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        } else {
            startDate = new Date(currentYear, 0, 1);
            endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        }

        // Build query
        const query = {
            applicationDate: { $gte: startDate, $lte: endDate }
        };

        // If specific department requested
        if (departmentId && departmentId !== 'all') {
            query.department = departmentId;
        }

        // Get all leave requests
        const leaveRequests = await LeaveRequest.find(query)
            .populate('employee', 'name email designation')
            .populate('department', 'name');

        // Calculate overall statistics
        const stats = {
            totalRequests: leaveRequests.length,
            approved: leaveRequests.filter(req => req.status === 'Approved').length,
            declined: leaveRequests.filter(req => req.status === 'Declined').length,
            pending: leaveRequests.filter(req => req.status === 'Pending').length,

            // Leave type breakdown
            annual: leaveRequests.filter(req => req.type.toLowerCase() === 'annual').length,
            casual: leaveRequests.filter(req => req.type.toLowerCase() === 'casual').length,

            // Total days
            totalDays: leaveRequests.reduce((sum, req) => sum + (req.numberOfDays || 0), 0),
            approvedDays: leaveRequests
                .filter(req => req.status === 'Approved')
                .reduce((sum, req) => sum + (req.numberOfDays || 0), 0),
        };

        // Monthly breakdown for yearly view
        let monthlyBreakdown = [];
        if (period === 'yearly') {
            monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
                const monthStart = new Date(currentYear, i, 1);
                const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

                const monthRequests = leaveRequests.filter(req => {
                    const appDate = new Date(req.applicationDate);
                    return appDate >= monthStart && appDate <= monthEnd;
                });

                return {
                    month: i + 1,
                    monthName: monthStart.toLocaleString('default', { month: 'short' }),
                    total: monthRequests.length,
                    approved: monthRequests.filter(r => r.status === 'Approved').length,
                    declined: monthRequests.filter(r => r.status === 'Declined').length,
                    pending: monthRequests.filter(r => r.status === 'Pending').length,
                    days: monthRequests.reduce((sum, r) => sum + (r.numberOfDays || 0), 0)
                };
            });
        }

        // Department-wise breakdown
        const departments = await Department.find({});
        const departmentStats = await Promise.all(
            departments.map(async (dept) => {
                const deptRequests = leaveRequests.filter(
                    req => req.department && req.department._id.toString() === dept._id.toString()
                );

                const deptMembers = await User.countDocuments({ department: dept._id });

                return {
                    departmentId: dept._id,
                    departmentName: dept.name,
                    totalMembers: deptMembers,
                    totalRequests: deptRequests.length,
                    approved: deptRequests.filter(r => r.status === 'Approved').length,
                    declined: deptRequests.filter(r => r.status === 'Declined').length,
                    pending: deptRequests.filter(r => r.status === 'Pending').length,
                    totalDays: deptRequests.reduce((sum, r) => sum + (r.numberOfDays || 0), 0),
                    approvedDays: deptRequests
                        .filter(r => r.status === 'Approved')
                        .reduce((sum, r) => sum + (r.numberOfDays || 0), 0),
                    averageDaysPerMember: deptMembers > 0
                        ? (deptRequests.reduce((sum, r) => sum + (r.numberOfDays || 0), 0) / deptMembers).toFixed(2)
                        : 0
                };
            })
        );

        // Employee-wise breakdown (top 10)
        const employeeStats = {};
        leaveRequests.forEach(req => {
            const empId = req.employee._id.toString();
            if (!employeeStats[empId]) {
                employeeStats[empId] = {
                    employeeId: empId,
                    name: req.employee.name,
                    designation: req.employee.designation,
                    department: req.department ? req.department.name : 'N/A',
                    totalRequests: 0,
                    approvedRequests: 0,
                    totalDays: 0,
                    approvedDays: 0
                };
            }
            employeeStats[empId].totalRequests++;
            employeeStats[empId].totalDays += req.numberOfDays || 0;
            if (req.status === 'Approved') {
                employeeStats[empId].approvedRequests++;
                employeeStats[empId].approvedDays += req.numberOfDays || 0;
            }
        });

        const topEmployees = Object.values(employeeStats)
            .sort((a, b) => b.approvedDays - a.approvedDays)
            .slice(0, 10);

        res.json({
            period,
            year: currentYear,
            month: period === 'monthly' ? currentMonth : null,
            departmentFilter: departmentId || 'all',
            stats,
            monthlyBreakdown,
            departmentStats: departmentStats.sort((a, b) => b.totalRequests - a.totalRequests),
            topEmployees,
            recentRequests: leaveRequests
                .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
                .slice(0, 10)
                .map(req => ({
                    id: req._id,
                    employeeName: req.employee.name,
                    designation: req.employee.designation,
                    department: req.department ? req.department.name : 'N/A',
                    type: req.type,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    numberOfDays: req.numberOfDays,
                    status: req.status,
                    applicationDate: req.applicationDate
                }))
        });
    } catch (error) {
        console.error("Get HR analytics error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getHoDAnalytics,
    getHRAnalytics
};
