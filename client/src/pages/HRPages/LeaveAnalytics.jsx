import HRLayout from '../../components/HRLayout';
import '../../styles/LeaveAnalytics.css';

const LeaveAnalytics = () => {
  return (
    <HRLayout>
      <div className="leave-analytics-container">
        <div className="page-header">
          <h1>Leave Analytics</h1>
          <p className="page-subtitle">View leave trends and statistics</p>
        </div>

        <div className="analytics-content">
          <div className="analytics-cards">
            <div className="analytics-card">
              <div className="card-header">
                <h3>Total Leaves</h3>
                <span className="card-icon">📊</span>
              </div>
              <div className="card-value">0</div>
              <p className="card-subtitle">This month</p>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Pending</h3>
                <span className="card-icon">⏳</span>
              </div>
              <div className="card-value">0</div>
              <p className="card-subtitle">Awaiting approval</p>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Approved</h3>
                <span className="card-icon">✅</span>
              </div>
              <div className="card-value">0</div>
              <p className="card-subtitle">This month</p>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Declined</h3>
                <span className="card-icon">❌</span>
              </div>
              <div className="card-value">0</div>
              <p className="card-subtitle">This month</p>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-placeholder">
              <div className="placeholder-icon">📈</div>
              <h3>Analytics Dashboard</h3>
              <p>Charts and graphs will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default LeaveAnalytics;
