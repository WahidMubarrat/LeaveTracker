import { useState, useEffect } from 'react';
import HRLayout from '../../components/HRLayout';
import { leaveAPI } from '../../services/api';
import '../../styles/ReviewApplication.css';

const ReviewApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'decline'
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveAPI.getPendingApprovals();
      setApplications(response.data.pendingApprovals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingRequestId(selectedRequest._id);
      setError('');

      await leaveAPI.updateLeaveStatus(selectedRequest._id, actionType, remarks);

      setShowModal(false);
      setSelectedRequest(null);
      setRemarks('');

      // Refresh the list
      await fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} application`);
      console.error(`Error ${actionType}ing application:`, err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getStatusClass = (application) => {
    if (application.status === 'Declined') return 'status-declined';
    if (application.approvedByHR && application.status === 'Approved') return 'status-approved';
    if (application.approvedByHoD) return 'status-pending-hr';
    return 'status-pending';
  };

  const getStatusText = (application) => {
    if (application.status === 'Declined') return 'Declined';
    if (application.approvedByHR && application.status === 'Approved') return 'Approved';
    if (application.approvedByHoD) return 'Pending HR Review';
    return 'Pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <HRLayout>
      <div className="review-application-container">
        <div className="page-header">
          <h1>Review Application</h1>
          <p className="page-subtitle">Review and approve pending leave applications</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="review-content">
          {loading ? (
            <div className="loading-state">Loading applications...</div>
          ) : applications.filter(app => app.approvedByHoD && !app.approvedByHR && app.status === 'Pending').length === 0 ? (
            <div className="applications-list">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Applications</h3>
                <p>There are no leave applications awaiting your review at the moment</p>
              </div>
            </div>
          ) : (
            <div className="applications-list">
              {applications
                .filter(app => app.approvedByHoD && !app.approvedByHR && app.status === 'Pending')
                .map(application => (
                  <div key={application._id} className="application-card">
                    <div className="application-header">
                      <div className="applicant-info">
                        <h3>{application.employee?.name || application.applicantName || 'N/A'}</h3>
                        <p className="applicant-email">{application.employee?.email || 'N/A'}</p>
                      </div>
                      <span className={`application-status ${getStatusClass(application)}`}>
                        {getStatusText(application)}
                      </span>
                    </div>

                    <div className="application-details">
                      <div className="detail-row">
                        <span className="detail-label">Designation:</span>
                        <span className="detail-value">{application.applicantDesignation || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">
                          {application.departmentName || application.department?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Leave Type:</span>
                        <span className="detail-value">{application.type || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Number of Days:</span>
                        <span className="detail-value">{application.numberOfDays || 'N/A'} day(s)</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">{formatDate(application.startDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">{formatDate(application.endDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Purpose:</span>
                        <span className="detail-value">{application.reason || 'N/A'}</span>
                      </div>
                      {application.leaveDocument && (
                        <div className="detail-row">
                          <span className="detail-label">Leave Document:</span>
                          <span className="detail-value">
                            <img
                              src={application.leaveDocument}
                              alt="Leave document"
                              style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '8px', marginTop: '0.5rem' }}
                            />
                          </span>
                        </div>
                      )}
                      {application.alternateEmployees && application.alternateEmployees.length > 0 ? (
                        <div className="detail-row">
                          <span className="detail-label">Alternate Employees:</span>
                          <span className="detail-value">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {application.alternateEmployees.map((alt, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span>{alt.employee?.name || 'Unknown'}</span>
                                  <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    backgroundColor: alt.response === 'ok' ? '#d4edda' : alt.response === 'sorry' ? '#f8d7da' : '#fff3cd',
                                    color: alt.response === 'ok' ? '#155724' : alt.response === 'sorry' ? '#721c24' : '#856404'
                                  }}>
                                    {alt.response === 'ok' ? '✓ OK' : alt.response === 'sorry' ? '✗ Sorry' : '⏳ Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </span>
                        </div>
                      ) : application.backupEmployee && (
                        <div className="detail-row">
                          <span className="detail-label">Alternate Employee:</span>
                          <span className="detail-value">
                            {application.backupEmployee.name || 'N/A'}
                          </span>
                        </div>
                      )}
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
                          <span className="detail-label">Your Remarks:</span>
                          <span className="detail-value">{application.hrRemarks}</span>
                        </div>
                      )}
                    </div>

                    {application.approvedByHoD && !application.approvedByHR && application.status === 'Pending' && (
                      <div className="application-actions">
                        <button
                          className="approve-btn"
                          onClick={() => handleActionClick(application, 'approve')}
                          disabled={processingRequestId === application._id}
                        >
                          {processingRequestId === application._id ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleActionClick(application, 'decline')}
                          disabled={processingRequestId === application._id}
                        >
                          {processingRequestId === application._id ? 'Processing...' : '✗ Decline'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Modal for remarks */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{actionType === 'approve' ? 'Approve' : 'Decline'} Leave Application</h3>
              <div className="modal-body">
                <label htmlFor="remarks">Remarks (Optional):</label>
                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={`Enter remarks for ${actionType === 'approve' ? 'approval' : 'decline'}...`}
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                    setRemarks('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className={actionType === 'approve' ? 'btn-primary' : 'btn-danger'}
                  onClick={handleConfirmAction}
                  disabled={processingRequestId === selectedRequest?._id}
                >
                  {processingRequestId === selectedRequest?._id ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approve' : 'Decline'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
};

export default ReviewApplication;
