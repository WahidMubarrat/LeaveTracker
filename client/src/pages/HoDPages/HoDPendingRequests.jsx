import { useState, useEffect } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import { leaveAPI } from '../../services/api';
import LeaveApplicationForm from '../../components/LeaveApplicationForm';
import { MdCheckCircle, MdCancel, MdFilterList, MdCalendarToday, MdPerson, MdEvent, MdExpandMore } from 'react-icons/md';
import '../../styles/HoDPendingRequests.css';

const HoDPendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'decline'
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveAPI.getPendingApprovals();
      setRequests(response.data.pendingApprovals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (e, request, action) => {
    e.stopPropagation(); // Prevent card expansion when clicking buttons
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
      await fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} request`);
      console.error(`Error ${actionType}ing request:`, err);
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
    <HoDLayout>
      <div className="hod-pending-requests-container">
        <div className="page-header">
          <h1>Pending Leave Requests</h1>
          <p className="page-subtitle">Review and manage leave requests from your department</p>
        </div>

        <RoleToggle />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : requests.filter(req => !req.approvedByHoD && req.status === 'Pending').length === 0 ? (
          <div className="empty-state">
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests
              .filter(req => !req.approvedByHoD && req.status === 'Pending')
              .map(request => (
                <div
                  key={request._id}
                  className={`request-list-card ${expandedId === request._id ? 'expanded' : ''}`}
                >
                  <div className="card-header" onClick={() => toggleExpand(request._id)}>
                    <div className="card-main-info">
                      <div className="applicant-primary">
                        <div className="applicant-avatar">
                          {request.employee?.profilePic ? (
                            <img src={request.employee.profilePic} alt={request.employee.name} />
                          ) : (
                            <span>{(request.employee?.name || request.applicantName || '?')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="applicant-text">
                          <span className="applicant-name">{request.employee?.name || request.applicantName || 'N/A'}</span>
                          <span className="applicant-dept">{request.applicantDesignation || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="leave-summary">
                        <span className="leave-type-tag">{request.type} Leave</span>
                        <span className="leave-duration">{request.numberOfDays} Day(s)</span>
                      </div>

                      <div className="leave-dates">
                        <MdCalendarToday />
                        <span>{formatDate(request.startDate)} — {formatDate(request.endDate)}</span>
                      </div>
                    </div>

                    <div className="card-status-actions">
                      <div className="quick-actions">
                        <button
                          className="quick-btn approve"
                          onClick={(e) => handleActionClick(e, request, 'approve')}
                          title="Quick Approve"
                        >
                          <MdCheckCircle />
                        </button>
                        <button
                          className="quick-btn reject"
                          onClick={(e) => handleActionClick(e, request, 'decline')}
                          title="Quick Decline"
                        >
                          <MdCancel />
                        </button>
                      </div>
                      <MdExpandMore className={`expand-icon ${expandedId === request._id ? 'rotated' : ''}`} />
                    </div>
                  </div>

                  {expandedId === request._id && (
                    <div className="card-expanded-content">
                      <div className="form-wrapper">
                        <LeaveApplicationForm
                          leaveDetails={request}
                          formatDate={formatDate}
                          showHeader={false}
                        />
                      </div>

                      <div className="expanded-actions">
                        <button
                          className="action-btn decline"
                          onClick={(e) => handleActionClick(e, request, 'decline')}
                          disabled={processingRequestId === request._id}
                        >
                          Decline Request
                        </button>
                        <button
                          className="action-btn approve"
                          onClick={(e) => handleActionClick(e, request, 'approve')}
                          disabled={processingRequestId === request._id}
                        >
                          {processingRequestId === request._id ? 'Processing...' : 'Approve Request'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Modal for remarks */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{actionType === 'approve' ? 'Approve' : 'Decline'} Leave Request</h3>
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
    </HoDLayout>
  );
};

export default HoDPendingRequests;
