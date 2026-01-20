import HRLayout from '../../components/HRLayout';
import '../../styles/LeaveAnalytics.css';

const LeaveAnalytics = () => {
  // Dummy data
  const monthlyStats = {
    total: 45,
    pending: 8,
    approved: 32,
    declined: 5
  };

  const leaveTypeData = [
    { type: 'Annual Leave', count: 28, color: '#4CAF50' },
    { type: 'Casual Leave', count: 12, color: '#2196F3' },
    { type: 'Sick Leave', count: 5, color: '#FF9800' }
  ];

  const departmentData = [
    { dept: 'CSE', leaves: 18, members: 60 },
    { dept: 'EEE', leaves: 10, members: 25 },
    { dept: 'CEE', leaves: 7, members: 20 },
    { dept: 'MPE', leaves: 6, members: 18 },
    { dept: 'BTM', leaves: 3, members: 12 },
    { dept: 'TVE', leaves: 1, members: 8 }
  ];

  const recentLeaves = [
    { id: 1, name: 'Dr. Md. Hasanul Kabir', dept: 'CSE', type: 'Annual', days: 5, status: 'Approved', date: '2026-01-15' },
    { id: 2, name: 'Rashid Ahmed', dept: 'EEE', type: 'Casual', days: 2, status: 'Pending', date: '2026-01-16' },
    { id: 3, name: 'Dr. Sanjida Rahman', dept: 'CEE', type: 'Sick', days: 1, status: 'Approved', date: '2026-01-14' },
    { id: 4, name: 'Kamal Hossain', dept: 'MPE', type: 'Annual', days: 7, status: 'Approved', date: '2026-01-12' },
    { id: 5, name: 'Fatima Khan', dept: 'BTM', type: 'Casual', days: 1, status: 'Declined', date: '2026-01-17' }
  ];

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
              <div className="card-value">{monthlyStats.total}</div>
              <p className="card-subtitle">This month</p>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Pending</h3>
                <span className="card-icon">⏳</span>
              </div>
              <div className="card-value">{monthlyStats.pending}</div>
              <p className="card-subtitle">Awaiting approval</p>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Approved</h3>
                <span className="card-icon">✅</span>
              </div>
              <div className="card-value">{monthlyStats.approved}</div>
              <p className="card-subtitle">This month</p>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Declined</h3>
                <span className="card-icon">❌</span>
              </div>
              <div className="card-value">{monthlyStats.declined}</div>
              <p className="card-subtitle">This month</p>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>Leave Distribution by Type</h3>
              <div className="chart-bars">
                {leaveTypeData.map((item, idx) => (
                  <div key={idx} className="bar-item">
                    <div className="bar-info">
                      <span className="bar-label">{item.type}</span>
                      <span className="bar-value">{item.count}</span>
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${(item.count / monthlyStats.total) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Department-wise Leave Statistics</h3>
              <div className="dept-stats">
                {departmentData.map((dept, idx) => (
                  <div key={idx} className="dept-stat-row">
                    <div className="dept-stat-name">
                      <span className={`dept-badge-small dept-${dept.dept.toLowerCase()}`}>
                        {dept.dept}
                      </span>
                    </div>
                    <div className="dept-stat-bar">
                      <div 
                        className="dept-stat-fill"
                        style={{ width: `${(dept.leaves / dept.members) * 100}%` }}
                      ></div>
                    </div>
                    <div className="dept-stat-count">
                      {dept.leaves}/{dept.members}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="recent-leaves-section">
            <h3>Recent Leave Applications</h3>
            <table className="recent-leaves-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Days</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.name}</td>
                    <td>
                      <span className={`dept-badge-small dept-${leave.dept.toLowerCase()}`}>
                        {leave.dept}
                      </span>
                    </td>
                    <td>{leave.type}</td>
                    <td>{leave.days} days</td>
                    <td>{new Date(leave.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge-small status-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default LeaveAnalytics;
