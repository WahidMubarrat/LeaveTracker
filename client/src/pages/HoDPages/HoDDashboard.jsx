import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import '../../styles/HoDDashboard.css';

const HoDDashboard = () => {
  return (
    <HoDLayout>
      <div className="hod-dashboard-container">
        <div className="page-header">
          <h1>Head of Department Dashboard</h1>
          <p className="page-subtitle">Manage your department and approve leave requests</p>
        </div>

        {/* Role Toggle */}
        <RoleToggle />

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Pending Requests</h3>
              <p className="stat-value">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Department Members</h3>
              <p className="stat-value">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>Approved This Month</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </div>

        <div className="dashboard-info">
          <p>Welcome to the Head of Department panel! Here you can:</p>
          <ul>
            <li>Review and approve leave requests from your department members</li>
            <li>View department members and their leave statistics</li>
            <li>Monitor leave trends and patterns</li>
          </ul>
        </div>
      </div>
    </HoDLayout>
  );
};

export default HoDDashboard;
