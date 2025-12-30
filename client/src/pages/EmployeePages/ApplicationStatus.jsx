import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';
import '../../styles/ApplicationStatus.css';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

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

  const getStatusProgress = (application) => {
    if (application.status === 'Declined') {
      return { width: '100%', color: '#dc3545' }; // Red - fully declined
    }
    
    if (application.approvedByHR && application.status === 'Approved') {
      return { width: '100%', color: '#28a745' }; // Green - fully approved
    }
    
    if (application.approvedByHoD) {
      return { width: '50%', color: '#ffc107' }; // Yellow - half way (HOD approved)
    }
    
    return { width: '0%', color: '#ffc107' }; // No progress - pending
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
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
              <div 
                key={application._id} 
                className="application-card"
                onClick={() => handleCardClick(application)}
                style={{ cursor: 'pointer' }}
              >
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

                {/* Status Progress Bar */}
                <div className="status-progress-container">
                  <div className="status-progress-bar">
                    <div 
                      className="status-progress-fill"
                      style={{
                        width: getStatusProgress(application).width,
                        backgroundColor: getStatusProgress(application).color,
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                      }}
                    ></div>
                  </div>
                  <div className="status-progress-labels">
                    <span className={application.approvedByHoD ? 'progress-label active' : 'progress-label'}>
                      HoD
                    </span>
                    <span className={application.approvedByHR && application.status === 'Approved' ? 'progress-label active' : 'progress-label'}>
                      HR
                    </span>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Number of Days:</span>
                    <span className="detail-value">{application.numberOfDays} day(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Application Date:</span>
                    <span className="detail-value">{formatDate(application.applicationDate)}</span>
                  </div>
                </div>
                
                <div className="view-details-hint">
                  Click to view full details →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Application Details */}
        {selectedApplication && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Application Details</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="modal-status-section">
                  <span className={`modal-status-badge ${getStatusClass(selectedApplication)}`}>
                    {getStatusMessage(selectedApplication)}
                  </span>
                  
                  <div className="status-progress-container">
                    <div className="status-progress-bar">
                      <div 
                        className="status-progress-fill"
                        style={{
                          width: getStatusProgress(selectedApplication).width,
                          backgroundColor: getStatusProgress(selectedApplication).color,
                        }}
                      ></div>
                    </div>
                    <div className="status-progress-labels">
                      <span className={selectedApplication.approvedByHoD ? 'progress-label active' : 'progress-label'}>
                        HoD
                      </span>
                      <span className={selectedApplication.approvedByHR && selectedApplication.status === 'Approved' ? 'progress-label active' : 'progress-label'}>
                        HR
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-details-grid">
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">Leave Type</span>
                    <span className="modal-detail-value">{selectedApplication.type} Leave</span>
                  </div>
                  
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">Application Date</span>
                    <span className="modal-detail-value">{formatDate(selectedApplication.applicationDate)}</span>
                  </div>
                  
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">Start Date</span>
                    <span className="modal-detail-value">{formatDate(selectedApplication.startDate)}</span>
                  </div>
                  
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">End Date</span>
                    <span className="modal-detail-value">{formatDate(selectedApplication.endDate)}</span>
                  </div>
                  
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">Number of Days</span>
                    <span className="modal-detail-value">{selectedApplication.numberOfDays} day(s)</span>
                  </div>
                  
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">Department</span>
                    <span className="modal-detail-value">
                      {selectedApplication.departmentName || selectedApplication.department?.name || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="modal-detail-item">
                    <span className="modal-detail-label">Designation</span>
                    <span className="modal-detail-value">{selectedApplication.applicantDesignation || 'N/A'}</span>
                  </div>
                  
                  <div className="modal-detail-item full-width">
                    <span className="modal-detail-label">Reason</span>
                    <span className="modal-detail-value">{selectedApplication.reason || 'N/A'}</span>
                  </div>
                  
                  {selectedApplication.alternateEmployees && selectedApplication.alternateEmployees.length > 0 && (
                    <div className="modal-detail-item full-width">
                      <span className="modal-detail-label">Alternate Employees</span>
                      <div className="modal-alternate-list">
                        {selectedApplication.alternateEmployees.map((alt, index) => (
                          <div key={index} className="modal-alternate-item">
                            <span className="alternate-name">{alt.employee?.name || 'Unknown'}</span>
                            <span className={`alternate-response ${alt.response}`}>
                              {alt.response === 'ok' && '✓ OK'}
                              {alt.response === 'sorry' && '✗ Sorry'}
                              {alt.response === 'pending' && '⏳ Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.leaveDocument && (
                    <div className="modal-detail-item full-width">
                      <span className="modal-detail-label">Leave Document</span>
                      <div className="modal-document-preview">
                        <img 
                          src={selectedApplication.leaveDocument} 
                          alt="Leave document" 
                          style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.hodRemarks && (
                    <div className="modal-detail-item full-width remarks-section">
                      <span className="modal-detail-label">HoD Remarks</span>
                      <span className="modal-detail-value remarks-text">{selectedApplication.hodRemarks}</span>
                    </div>
                  )}
                  
                  {selectedApplication.hrRemarks && (
                    <div className="modal-detail-item full-width remarks-section">
                      <span className="modal-detail-label">HR Remarks</span>
                      <span className="modal-detail-value remarks-text">{selectedApplication.hrRemarks}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-close-modal" onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApplicationStatus;
