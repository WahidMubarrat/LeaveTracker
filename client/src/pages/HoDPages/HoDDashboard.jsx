import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import { hodDashboardAPI, userAPI } from '../../services/api';
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
  const [designationCounts, setDesignationCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    fetchDesignationCounts();
  }, []);

  const fetchDesignationCounts = async () => {
    try {
      const response = await userAPI.getDepartmentMembers();
      const departmentMembers = (response.data.members || []).filter(member => {
        if (member.roles && member.roles.includes('HR')) return false;
        if (member.role === 'HR') return false;
        return true;
      });

      const counts = departmentMembers.reduce((acc, member) => {
        const key = member.designation || 'Other';
        acc[key] = (acc[key] || 0) + 1;
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

  const goToMembers = (statusFilter = 'all') => {
    navigate('/hod/department-members', { state: { statusFilter } });
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
                      <div className="pie-chart-label">Total</div>
                    </div>
                  </div>
                  <div className="member-stat-column">
                    <div className="member-stat-buttons">
                      <button className="member-stat-card member-stat-total" onClick={() => goToMembers('all')}>
                        <span className="stat-card-label">Total Members</span>
                        <span className="stat-card-count">{stats.memberStats.totalMembers}</span>
                      </button>
                      <button className="member-stat-card member-stat-active" onClick={() => goToMembers('onDuty')}>
                        <span className="stat-card-label">Active</span>
                        <span className="stat-card-count">{stats.memberStats.activeMembers}</span>
                      </button>
                      <button className="member-stat-card member-stat-leave" onClick={() => goToMembers('onLeave')}>
                        <span className="stat-card-label">On Leave</span>
                        <span className="stat-card-count">{stats.memberStats.membersOnLeave}</span>
                      </button>
                    </div>

                    {Object.keys(designationCounts).length > 0 && (
                      <div className="designation-section">
                       
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
