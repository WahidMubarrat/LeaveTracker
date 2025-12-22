import { useState, useEffect } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import { leaveAPI } from '../../services/api';
import '../../styles/HoDPendingRequests.css';

const HoDPendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // all, pending, approved, declined
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'decline'
  const [error, setError] = useState('');

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
      await fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} request`);
      console.error(`Error ${actionType}ing request:`, err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !req.approvedByHoD && req.status === 'Pending';
    if (filter === 'approved') return req.approvedByHoD && req.status === 'Pending';
    if (filter === 'declined') return req.status === 'Declined';
    return true;
  });

  const getStatusClass = (request) => {
    if (request.status === 'Declined') return 'status-declined';
    if (request.approvedByHoD) return 'status-approved';
    return 'status-pending';
  };

  const getStatusText = (request) => {
    if (request.status === 'Declined') return 'Declined';
    if (request.approvedByHoD) return 'Approved by HoD';
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
    <HoDLayout>
      <div className="hod-pending-requests-container">
        <div className="page-header">
          <h1>Pending Leave Requests</h1>
          <p className="page-subtitle">Review and manage leave requests from your department</p>
        </div>

        <RoleToggle />

        {error && <div className="error-message">{error}</div>}

        <div className="requests-controls">
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('all')}
            >
              All ({requests.length})
            </button>
            <button 
              className={filter === 'pending' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('pending')}
            >
              Pending ({requests.filter(r => !r.approvedByHoD && r.status === 'Pending').length})
            </button>
            <button 
              className={filter === 'approved' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('approved')}
            >
              Approved ({requests.filter(r => r.approvedByHoD && r.status === 'Pending').length})
            </button>
            <button 
              className={filter === 'declined' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('declined')}
            >
              Declined ({requests.filter(r => r.status === 'Declined').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No requests found</h3>
            <p>There are no leave requests matching your current filter.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map(request => (
              <div key={request._id} className="request-card">
                <div className="request-header">
                  <div className="employee-info">
                    <h3>{request.employee?.name || request.applicantName || 'N/A'}</h3>
                    <p className="employee-email">{request.employee?.email || 'N/A'}</p>
                  </div>
                  <span className={`request-status ${getStatusClass(request)}`}>
                    {getStatusText(request)}
                  </span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Designation:</span>
                    <span className="detail-value">{request.applicantDesignation || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">
                      {request.departmentName || request.department?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Leave Type:</span>
                    <span className="detail-value">{request.type || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Number of Days:</span>
                    <span className="detail-value">{request.numberOfDays || 'N/A'} day(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(request.startDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">End Date:</span>
                    <span className="detail-value">{formatDate(request.endDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Purpose:</span>
                    <span className="detail-value">{request.reason || 'N/A'}</span>
                  </div>
                  {request.backupEmployee && (
                    <div className="detail-row">
                      <span className="detail-label">Alternate Employee:</span>
                      <span className="detail-value">
                        {request.backupEmployee.name || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Application Date:</span>
                    <span className="detail-value">{formatDate(request.applicationDate)}</span>
                  </div>
                  {request.hodRemarks && (
                    <div className="detail-row remarks">
                      <span className="detail-label">Your Remarks:</span>
                      <span className="detail-value">{request.hodRemarks}</span>
                    </div>
                  )}
                </div>

                {!request.approvedByHoD && request.status === 'Pending' && (
                  <div className="request-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleActionClick(request, 'approve')}
                      disabled={processingRequestId === request._id}
                    >
                      {processingRequestId === request._id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleActionClick(request, 'decline')}
                      disabled={processingRequestId === request._id}
                    >
                      {processingRequestId === request._id ? 'Processing...' : '✗ Decline'}
                    </button>
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

