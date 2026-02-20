import { useState, useEffect } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import { hodDashboardAPI } from '../../services/api';
import { MdPending, MdGroup, MdCheckCircle, MdBeachAccess } from 'react-icons/md';
import '../../styles/HoDDashboard.css';

import DashboardNotification from '../../components/DashboardNotification';

const HoDDashboard = () => {
  const [stats, setStats] = useState({
    memberStats: {
      totalMembers: 0,
      activeMembers: 0,
      membersOnLeave: 0
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await hodDashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
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

  return (
    <HoDLayout>
      <div className="hod-dashboard-container">
        <div className="page-header">
          <h1>Head of Department Dashboard</h1>
        </div>

        {/* Role Toggle */}
        <RoleToggle />

        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Loading statistics...</div>
        ) : (
          <div className="dashboard-main-sections">
            <div className="pie-charts-container">
              {/* Members Pie Chart */}
              <div className="pie-chart-section">
                <h2 className="chart-title">Department Members</h2>
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
                      <div className="pie-chart-label">Total</div>
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
                linkTo="/hod/pending-requests"
              />
            </div>
          </div>
        )}
      </div>
    </HoDLayout>
  );
};

export default HoDDashboard;
