import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';
import '../../styles/LeaveHistory.css';

const LeaveHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyHistory();
      const apps = response.data.applications || [];

      // Sort by application date - latest first
      const sortedApps = apps.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setApplications(sortedApps);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave history');
      console.error('Error fetching leave history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredHistory = applications.filter(app => {
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesType = filterType === 'All' || app.type === filterType;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    declined: applications.filter(a => a.status === 'Declined').length,
    totalDays: applications
      .filter(a => a.status === 'Approved')
      .reduce((sum, a) => sum + (a.numberOfDays || 0), 0)
  };

  if (loading) {
    return (
      <Layout>
        <div className="history-container">
          <div className="history-header">
            <h1>Leave History</h1>
            <p className="history-subtitle">Loading your leave history...</p>
          </div>
          <div className="history-loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="history-container">
        <div className="history-header">
          <h1>Leave History</h1>
          <p className="history-subtitle">View all your approved and declined leave applications</p>
        </div>

        {error && <div className="history-error">{error}</div>}

        <div className="history-stats">
          <div className="stat-box">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.declined}</h3>
              <p>Declined</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalDays}</h3>
              <p>Days Taken</p>
            </div>
          </div>
        </div>

        <div className="history-filters">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Annual">Annual Leave</option>
            <option value="Casual">Casual Leave</option>
          </select>
        </div>

        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <div className="history-empty">
              <p>No leave history found</p>
            </div>
          ) : (
            filteredHistory.map(app => (
              <div
                key={app._id}
                className={`history-card ${expandedId === app._id ? 'expanded' : ''}`}
              >
                {/* Clickable Summary Row */}
                <div
                  className="history-card-header"
                  onClick={() => handleToggleExpand(app._id)}
                >
                  <div className="header-left">
                    <div className="leave-info">
                      <span className={`leave-type-badge type-${app.type.toLowerCase()}`}>
                        {app.type}
                      </span>
                      <span className={`status-badge-history status-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="leave-dates-summary">
                      <span className="calendar-icon">📅</span>
                      {formatDate(app.startDate)} — {formatDate(app.endDate)}
                      <span className="days-tag">{app.numberOfDays} days</span>
                    </div>
                  </div>

                  <div className="header-right">
                    <div className="application-date-minimal">
                      Applied {formatDate(app.applicationDate)}
                    </div>
                    <span className={`expand-icon ${expandedId === app._id ? 'rotated' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Expandable Detail Section - Form Style */}
                <div className={`history-card-body ${expandedId === app._id ? 'visible' : ''}`}>
                  <div className="form-container">
                    <div className="form-header-banner">
                      <span className="form-title">LEAVE APPLICATION FORM</span>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">Employee Information</h4>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Applicant Name</label>
                          <div className="value">{app.applicantName || 'N/A'}</div>
                        </div>
                        <div className="form-field">
                          <label>Designation</label>
                          <div className="value">{app.applicantDesignation || 'N/A'}</div>
                        </div>
                        <div className="form-field">
                          <label>Department</label>
                          <div className="value">{app.departmentName || app.department?.name || 'N/A'}</div>
                        </div>
                        <div className="form-field">
                          <label>Submission Date</label>
                          <div className="value">{formatDate(app.createdAt)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">Leave Details</h4>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Type of Leave</label>
                          <div className="value highlight-text">{app.type} Leave</div>
                        </div>
                        <div className="form-field">
                          <label>Total Duration</label>
                          <div className="value">{app.numberOfDays} Day(s)</div>
                        </div>
                        <div className="form-field">
                          <label>Start Date</label>
                          <div className="value">{formatDate(app.startDate)}</div>
                        </div>
                        <div className="form-field">
                          <label>End Date</label>
                          <div className="value">{formatDate(app.endDate)}</div>
                        </div>
                      </div>
                      <div className="form-field full-width">
                        <label>Purpose / Reason for Leave</label>
                        <div className="value reason-box">{app.reason || 'No reason provided'}</div>
                      </div>
                    </div>

                    {app.alternateEmployees && app.alternateEmployees.length > 0 && (
                      <div className="form-section">
                        <h4 className="section-title">Work Coverage Plan (Alternate Employees)</h4>
                        <div className="alternate-form-list">
                          {app.alternateEmployees.map((alt, index) => (
                            <div key={index} className="alternate-form-row">
                              <span className="alt-label">Alternate {index + 1}:</span>
                              <span className="alt-value">{alt.employee?.name || 'Unknown'}</span>
                              <span className="alt-period">({formatDate(alt.startDate)} - {formatDate(alt.endDate)})</span>
                              <span className={`alt-status-tag ${alt.response}`}>
                                {alt.response === 'ok' ? 'CONSENTED' : alt.response === 'sorry' ? 'DECLINED' : 'PENDING'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.leaveDocument && (
                      <div className="form-section">
                        <h4 className="section-title">Supporting Documents</h4>
                        <div className="form-document-box">
                          <img src={app.leaveDocument} alt="Leave Document" />
                        </div>
                      </div>
                    )}

                    <div className="form-section approval-section">
                      <h4 className="section-title">Official Review & Status</h4>
                      <div className="approval-grid">
                        <div className="approval-column">
                          <div className="form-field">
                            <label>HOD Status</label>
                            <div className={`value ${app.status === 'Approved' || app.approvedByHoD ? 'status-text-approved' : 'status-text-declined'}`}>
                              {app.status === 'Approved' || app.approvedByHoD ? 'Approved' : 'Declined'}
                            </div>
                          </div>
                          {app.hodRemarks && (
                            <div className="form-field remarks-field">
                              <label>HOD Remarks</label>
                              <div className="value-remarks">{app.hodRemarks}</div>
                            </div>
                          )}
                        </div>

                        <div className="approval-column">
                          <div className="form-field">
                            <label>HR Status</label>
                            <div className={`value ${app.status === 'Approved' ? 'status-text-approved' : 'status-text-declined'}`}>
                              {app.status === 'Approved' ? 'Approved' : 'Declined'}
                            </div>
                          </div>
                          {app.hrRemarks && (
                            <div className="form-field remarks-field">
                              <label>HR Remarks</label>
                              <div className="value-remarks">{app.hrRemarks}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaveHistory;
