import { useState, useEffect, useCallback } from 'react';
import HRLayout from '../../components/HRLayout';
import { hrDashboardAPI, userAPI } from '../../services/api';
import { MdPending, MdGroup, MdCheckCircle, MdBeachAccess, MdLock } from 'react-icons/md';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import '../../styles/HRDashboard.css';

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
        }
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

    const calculatePercentage = (value, total) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

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

    const getRequestsPieData = () => {
        const total = stats.requestStats.totalRequests;
        const accepted = stats.requestStats.acceptedRequests;
        const declined = stats.requestStats.declinedRequests;
        const pending = stats.requestStats.pendingRequests;

        if (total === 0) return { acceptedPercent: 0, declinedPercent: 0, pendingPercent: 0 };

        return {
            acceptedPercent: (accepted / total) * 100,
            declinedPercent: (declined / total) * 100,
            pendingPercent: (pending / total) * 100
        };
    };

    return (
        <HRLayout>
            <div className="hr-dashboard-container">
                <div className="page-header-container">
                    <div className="page-header">
                        <h1>HR Dashboard</h1>
                        <p className="page-subtitle">Unified summary for all departments</p>
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
                    <>
                        {/* 1. PIE CHARTS FIRST */}
                        <div className="pie-charts-container">
                            <div className="pie-chart-section">
                                <h2 className="chart-title">Global Workforce</h2>
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

                            <div className="pie-chart-section">
                                <h2 className="chart-title">Requests (Current Month)</h2>
                                <div className="pie-chart-wrapper">
                                    <div
                                        className="pie-chart"
                                        style={{
                                            background: `conic-gradient(
                        #10b981 0% ${getRequestsPieData().acceptedPercent}%,
                        #ef4444 ${getRequestsPieData().acceptedPercent}% ${getRequestsPieData().acceptedPercent + getRequestsPieData().declinedPercent}%,
                        #8b5cf6 ${getRequestsPieData().acceptedPercent + getRequestsPieData().declinedPercent}% 100%
                      )`
                                        }}
                                    >
                                        <div className="pie-chart-center">
                                            <div className="pie-chart-total">{stats.requestStats.totalRequests}</div>
                                            <div className="pie-chart-label">Total Logs</div>
                                        </div>
                                    </div>
                                    <div className="pie-legend">
                                        <div className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                                            <span className="legend-label">Approved: {stats.requestStats.acceptedRequests}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                                            <span className="legend-label">Declined: {stats.requestStats.declinedRequests}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
                                            <span className="legend-label">Pending: {stats.requestStats.pendingRequests}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. SUMMARY CARDS SECOND */}
                        <div className="additional-stats">
                            <div className="stat-box pending-box">
                                <div className="stat-box-header">
                                    <MdPending className="stat-box-icon" />
                                    <h3>Total Pending</h3>
                                </div>
                                <div className="stat-box-value">{stats.requestStats.pendingRequests}</div>
                                <div className="stat-box-bar">
                                    <div
                                        className="stat-box-bar-fill pending-fill"
                                        style={{ width: '100%' }}
                                    ></div>
                                </div>
                                <div className="stat-box-footer">
                                    Awaiting global HR/HoD action
                                </div>
                            </div>

                            <div className="stat-box active-box">
                                <div className="stat-box-header">
                                    <MdGroup className="stat-box-icon" />
                                    <h3>Active (Global)</h3>
                                </div>
                                <div className="stat-box-value">{stats.memberStats.activeMembers}</div>
                                <div className="stat-box-bar">
                                    <div
                                        className="stat-box-bar-fill active-fill"
                                        style={{ width: `${calculatePercentage(stats.memberStats.activeMembers, stats.memberStats.totalMembers)}%` }}
                                    ></div>
                                </div>
                                <div className="stat-box-footer">
                                    {calculatePercentage(stats.memberStats.activeMembers, stats.memberStats.totalMembers)}% of total {stats.memberStats.totalMembers} employees
                                </div>
                            </div>

                            <div className="stat-box approved-box">
                                <div className="stat-box-header">
                                    <MdCheckCircle className="stat-box-icon" />
                                    <h3>Monthly Approved</h3>
                                </div>
                                <div className="stat-box-value">{stats.requestStats.acceptedRequests}</div>
                                <div className="stat-box-bar">
                                    <div
                                        className="stat-box-bar-fill approved-fill"
                                        style={{ width: `${calculatePercentage(stats.requestStats.acceptedRequests, stats.requestStats.totalRequests)}%` }}
                                    ></div>
                                </div>
                                <div className="stat-box-footer">
                                    {calculatePercentage(stats.requestStats.acceptedRequests, stats.requestStats.totalRequests)}% global approval rate
                                </div>
                            </div>

                            <div className="stat-box leave-box">
                                <div className="stat-box-header">
                                    <MdBeachAccess className="stat-box-icon" />
                                    <h3>Currently On Leave</h3>
                                </div>
                                <div className="stat-box-value">{stats.memberStats.membersOnLeave}</div>
                                <div className="stat-box-bar">
                                    <div
                                        className="stat-box-bar-fill leave-fill"
                                        style={{ width: `${calculatePercentage(stats.memberStats.membersOnLeave, stats.memberStats.totalMembers)}%` }}
                                    ></div>
                                </div>
                                <div className="stat-box-footer">
                                    {calculatePercentage(stats.memberStats.membersOnLeave, stats.memberStats.totalMembers)}% workforce away
                                </div>
                            </div>
                        </div>
                    </>
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
