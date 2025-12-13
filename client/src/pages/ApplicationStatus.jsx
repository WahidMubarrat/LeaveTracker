import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import '../styles/ApplicationStatus.css';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leaves/my-applications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setError('Failed to load applications');
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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'declined':
        return '❌';
      default:
        return '⏳';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status.toLowerCase() === 'pending').length,
    approved: applications.filter(a => a.status.toLowerCase() === 'approved').length,
    declined: applications.filter(a => a.status.toLowerCase() === 'declined').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="status-loading">Loading applications...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="status-container">
        <div className="status-header">
          <h1>Application Status</h1>
          <p className="status-subtitle">Track your leave applications</p>
        </div>

        {error && <div className="status-error">{error}</div>}

        <div className="status-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({statusCounts.all})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({statusCounts.approved})
          </button>
          <button
            className={`filter-btn ${filter === 'declined' ? 'active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            Declined ({statusCounts.declined})
          </button>
        </div>

        <div className="status-content">
          {filteredApplications.length > 0 ? (
            <div className="applications-grid">
              {filteredApplications.map((application) => (
                <div key={application._id} className={`application-card ${getStatusClass(application.status)}`}>
                  <div className="application-header-section">
                    <div className="application-type">
                      <span className={`type-badge ${application.type.toLowerCase()}`}>
                        {application.type}
                      </span>
                      <span className="application-days">
                        {Math.ceil((new Date(application.endDate) - new Date(application.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                      </span>
                    </div>
                    <span className={`status-icon ${getStatusClass(application.status)}`}>
                      {getStatusIcon(application.status)}
                    </span>
                  </div>

                  <div className="application-dates">
                    <div className="date-item">
                      <label>From</label>
                      <p>{new Date(application.startDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</p>
                    </div>
                    <div className="date-arrow">→</div>
                    <div className="date-item">
                      <label>To</label>
                      <p>{new Date(application.endDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</p>
                    </div>
                  </div>

                  {application.reason && (
                    <div className="application-reason">
                      <label>Reason:</label>
                      <p>{application.reason}</p>
                    </div>
                  )}

                  {application.backupEmployee && (
                    <div className="application-backup">
                      <label>Backup:</label>
                      <p>{application.backupEmployee.name}</p>
                    </div>
                  )}

                  <div className="application-footer">
                    <div className="application-status-badge">
                      <span className={`status-badge ${getStatusClass(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="application-date">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="application-approval-status">
                    <div className={`approval-step ${application.approvedByHoD ? 'approved' : 'pending'}`}>
                      <span className="approval-icon">{application.approvedByHoD ? '✓' : '○'}</span>
                      <span className="approval-label">HoD Approval</span>
                    </div>
                    <div className={`approval-step ${application.approvedByHoA ? 'approved' : 'pending'}`}>
                      <span className="approval-icon">{application.approvedByHoA ? '✓' : '○'}</span>
                      <span className="approval-label">HoA Approval</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="status-empty">
              <div className="empty-icon">📊</div>
              <p>No applications found</p>
              <p className="empty-subtitle">
                {filter === 'all'
                  ? 'Your leave applications will appear here'
                  : `No ${filter} applications`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationStatus;
