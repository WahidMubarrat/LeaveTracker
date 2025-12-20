import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';
import '../../styles/ApplicationStatus.css';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyApplications();
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (application) => {
    if (application.status === 'Declined') {
      return 'Application Declined';
    }
    
    if (application.approvedByHR && application.status === 'Approved') {
      return 'Application Approved';
    }
    
    if (application.approvedByHoD) {
      return 'Approved by HoD';
    }
    
    return 'Pending';
  };

  const getStatusClass = (application) => {
    if (application.status === 'Declined') {
      return 'status-declined';
    }
    
    if (application.approvedByHR && application.status === 'Approved') {
      return 'status-approved';
    }
    
    if (application.approvedByHoD) {
      return 'status-pending-hod';
    }
    
    return 'status-pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="status-container">
          <div className="status-header">
            <h1>Application Status</h1>
            <p className="status-subtitle">Loading your applications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="status-container">
        <div className="status-header">
          <h1>Application Status</h1>
          <p className="status-subtitle">Track the status of your leave applications</p>
        </div>

        {error && <div className="status-error">{error}</div>}

        {applications.length === 0 ? (
          <div className="status-placeholder">
            <div className="placeholder-icon">📋</div>
            <h2>No Applications Found</h2>
            <p>You haven't submitted any leave applications yet.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-card-header">
                  <div className="application-info">
                    <h3>{application.type} Leave</h3>
                    <p className="application-dates">
                      {formatDate(application.startDate)} - {formatDate(application.endDate)}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusClass(application)}`}>
                    {getStatusMessage(application)}
                  </span>
                </div>

                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Number of Days:</span>
                    <span className="detail-value">{application.numberOfDays} day(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">
                      {application.departmentName || application.department?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Designation:</span>
                    <span className="detail-value">{application.applicantDesignation || 'N/A'}</span>
                  </div>
                  {application.backupEmployee && (
                    <div className="detail-row">
                      <span className="detail-label">Alternate Employee:</span>
                      <span className="detail-value">
                        {application.backupEmployee.name || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Purpose:</span>
                    <span className="detail-value">{application.reason || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Application Date:</span>
                    <span className="detail-value">{formatDate(application.applicationDate)}</span>
                  </div>
                  
                  {application.hodRemarks && (
                    <div className="detail-row remarks">
                      <span className="detail-label">HoD Remarks:</span>
                      <span className="detail-value">{application.hodRemarks}</span>
                    </div>
                  )}
                  
                  {application.hrRemarks && (
                    <div className="detail-row remarks">
                      <span className="detail-label">HR Remarks:</span>
                      <span className="detail-value">{application.hrRemarks}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApplicationStatus;
