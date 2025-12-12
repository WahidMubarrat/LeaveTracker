import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import '../styles/LeaveHistory.css';

const LeaveHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leaves/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch leave history:', error);
      setError('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'declined':
        return 'status-declined';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="history-loading">Loading leave history...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="history-container">
        <div className="history-header">
          <h1>Leave History</h1>
          <p className="history-subtitle">View all your past leave applications</p>
        </div>

        {error && <div className="history-error">{error}</div>}

        <div className="history-content">
          {history.length > 0 ? (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <span className={`leave-type-badge ${leave.type.toLowerCase()}`}>
                          {leave.type}
                        </span>
                      </td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="days-cell">
                        {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                      </td>
                      <td className="reason-cell">{leave.reason || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>{new Date(leave.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="history-empty">
              <div className="empty-icon">📋</div>
              <p>No leave history found</p>
              <p className="empty-subtitle">Your leave applications will appear here</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaveHistory;
