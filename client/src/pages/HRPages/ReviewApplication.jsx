import { useState, useEffect } from 'react';
import HRLayout from '../../components/HRLayout';
import { leaveAPI } from '../../services/api';
import LeaveApplicationForm from '../../components/LeaveApplicationForm';
import { MdCheckCircle, MdCancel, MdCalendarToday, MdExpandMore } from 'react-icons/md';
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
  const [expandedId, setExpandedId] = useState(null);

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

  const handleActionClick = (e, request, action) => {
    e.stopPropagation(); // Avoid card expansion
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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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

        <div className="review-content-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading applications...</p>
            </div>
          ) : applications.filter(app => app.approvedByHoD && !app.approvedByHR && app.status === 'Pending').length === 0 ? (
            <div className="empty-state">
              <p>No Applications</p>
            </div>
          ) : (
            <div className="applications-list">
              {applications
                .filter(app => app.approvedByHoD && !app.approvedByHR && app.status === 'Pending')
                .map(application => (
                  <div
                    key={application._id}
                    className={`application-list-card ${expandedId === application._id ? 'expanded' : ''}`}
                  >
                    <div className="card-header" onClick={() => toggleExpand(application._id)}>
                      <div className="card-main-info">
                        <div className="applicant-primary">
                          <div className="applicant-avatar">
                            {application.employee?.profilePic ? (
                              <img src={application.employee.profilePic} alt={application.employee.name} />
                            ) : (
                              <span>{(application.employee?.name || application.applicantName || '?')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="applicant-text">
                            <span className="applicant-name">{application.employee?.name || application.applicantName || 'N/A'}</span>
                            <span className="applicant-dept">{application.applicantDesignation || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="leave-summary">
                          <span className="leave-type-tag">{application.type} Leave</span>
                          <span className="leave-duration">{application.numberOfDays} Day(s)</span>
                        </div>

                        <div className="leave-dates">
                          <MdCalendarToday />
                          <span>{formatDate(application.startDate)} — {formatDate(application.endDate)}</span>
                        </div>
                      </div>

                      <div className="card-status-actions">
                        <div className="quick-actions">
                          <button
                            className="quick-btn approve"
                            onClick={(e) => handleActionClick(e, application, 'approve')}
                            title="Quick Approve"
                          >
                            <MdCheckCircle />
                          </button>
                          <button
                            className="quick-btn reject"
                            onClick={(e) => handleActionClick(e, application, 'decline')}
                            title="Quick Decline"
                          >
                            <MdCancel />
                          </button>
                        </div>
                        <MdExpandMore className={`expand-icon ${expandedId === application._id ? 'rotated' : ''}`} />
                      </div>
                    </div>

                    {expandedId === application._id && (
                      <div className="card-expanded-content">
                        <div className="form-wrapper">
                          <LeaveApplicationForm
                            leaveDetails={application}
                            formatDate={formatDate}
                            showHeader={false}
                          />
                        </div>

                        <div className="expanded-actions">
                          <button
                            className="action-btn decline"
                            onClick={(e) => handleActionClick(e, application, 'decline')}
                            disabled={processingRequestId === application._id}
                          >
                            Decline Application
                          </button>
                          <button
                            className="action-btn approve"
                            onClick={(e) => handleActionClick(e, application, 'approve')}
                            disabled={processingRequestId === application._id}
                          >
                            {processingRequestId === application._id ? 'Processing...' : 'Approve Application'}
                          </button>
                        </div>
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
