import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HRLayout from '../../components/HRLayout';
import { hrDashboardAPI, userAPI } from '../../services/api';
import { MdPending, MdGroup, MdCheckCircle, MdBeachAccess, MdLock } from 'react-icons/md';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import '../../styles/HRDashboard.css';

import DashboardNotification from '../../components/DashboardNotification';

const HRDashboard = () => {
    const [stats, setStats] = useState({
        memberStats: {
            totalMembers: 0,
            activeMembers: 0,
            membersOnLeave: 0,
            totalDepartments: 0
        },
        requestStats: {
            totalRequests: 0,
            acceptedRequests: 0,
            declinedRequests: 0,
            pendingRequests: 0
        },
        latestPendingRequest: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [designationCounts, setDesignationCounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
        fetchDesignationCounts();
    }, []);

    const fetchDesignationCounts = async () => {
        try {
            const response = await userAPI.getAllMembersGrouped();
            const departments = response.data.departments || [];

            const counts = departments.reduce((acc, dept) => {
                (dept.members || []).forEach(member => {
                    const key = member.designation || 'Other';
                    acc[key] = (acc[key] || 0) + 1;
                });
                return acc;
            }, {});

            setDesignationCounts(counts);
        } catch (err) {
            console.error('Error fetching designation counts:', err);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await hrDashboardAPI.getStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching HR dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = useCallback(async (passwordData) => {
        try {
            const response = await userAPI.changePassword(passwordData);
            return { success: true, message: response.data.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to change password',
            };
        }
    }, []);

    const getMembersPieData = () => {
        const total = stats.memberStats.totalMembers;
        const active = stats.memberStats.activeMembers;
        const onLeave = stats.memberStats.membersOnLeave;

        if (total === 0) return { activePercent: 0, leavePercent: 0 };

        return {
            activePercent: (active / total) * 100,
            leavePercent: (onLeave / total) * 100
        };
    };

    const goToMembers = (statusFilter = 'All') => {
        navigate('/hr/system-members', { state: { statusFilter } });
    };

    return (
        <HRLayout>
            <div className="hr-dashboard-container">
                <div className="page-header-container">
                    <div className="page-header">
                        <h1>HR Dashboard</h1>
                    </div>
                    <button
                        className="btn-change-password-hr"
                        onClick={() => setIsPasswordModalOpen(true)}
                    >
                        <MdLock /> Change Password
                    </button>
                </div>

                {error && <div className="dashboard-error">{error}</div>}

                {loading ? (
                    <div className="dashboard-loading">Loading global statistics...</div>
                ) : (
                    <div className="dashboard-main-sections">
                        <div className="pie-charts-container">
                            <div className="pie-chart-section">
                                <h2 className="chart-title">Total Members</h2>
                                <div className="pie-chart-wrapper">
                                    <div
                                        className="pie-chart"
                                        style={{
                                            background: `conic-gradient(
                                                #10b981 0% ${getMembersPieData().activePercent}%,
                                                #f59e0b ${getMembersPieData().activePercent}% 100%
                                            )`
                                        }}
                                    >
                                        <div className="pie-chart-center">
                                            <div className="pie-chart-total">{stats.memberStats.totalMembers}</div>
                                            <div className="pie-chart-label">Employees</div>
                                        </div>
                                    </div>
                                    <div className="member-stat-column">
                                        <div className="member-stat-buttons">
                                            <button className="member-stat-card member-stat-total" onClick={() => goToMembers('All')}>
                                                <span className="stat-card-label">Total Members</span>
                                                <span className="stat-card-count">{stats.memberStats.totalMembers}</span>
                                            </button>
                                            <button className="member-stat-card member-stat-active" onClick={() => goToMembers('Active')}>
                                                <span className="stat-card-label">Active</span>
                                                <span className="stat-card-count">{stats.memberStats.activeMembers}</span>
                                            </button>
                                            <button className="member-stat-card member-stat-leave" onClick={() => goToMembers('On Leave')}>
                                                <span className="stat-card-label">On Leave</span>
                                                <span className="stat-card-count">{stats.memberStats.membersOnLeave}</span>
                                            </button>
                                        </div>

                                        {Object.keys(designationCounts).length > 0 && (
                                            <div className="designation-section">
                                                <h3 className="designation-title">Designation Breakdown</h3>
                                                <div className="designation-stat-buttons">
                                                    {Object.entries(designationCounts)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .map(([designation, count]) => (
                                                            <div key={designation} className="designation-stat-card">
                                                                <div className="designation-card-label">{designation}</div>
                                                                <div className="designation-card-count">{count}</div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notification Section */}
                            <DashboardNotification
                                pendingRequest={stats.latestPendingRequest}
                                totalCount={stats.requestStats.pendingRequests}
                                linkTo="/hr/review-application"
                            />
                        </div>
                    </div>
                )}

                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onPasswordChange={handlePasswordChange}
                />
            </div>
        </HRLayout>
    );
};

export default HRDashboard;
