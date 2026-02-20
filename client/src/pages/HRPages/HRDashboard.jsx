import { useState, useEffect, useCallback } from 'react';
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

    useEffect(() => {
        fetchDashboardStats();
    }, []);

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
                                <h2 className="chart-title">Total Employee</h2>
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
                                    <div className="pie-legend">
                                        <div className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                                            <span className="legend-label">Active: {stats.memberStats.activeMembers}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
                                            <span className="legend-label">On Leave: {stats.memberStats.membersOnLeave}</span>
                                        </div>
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
