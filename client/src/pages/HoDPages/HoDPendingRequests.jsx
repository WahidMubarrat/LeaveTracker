import { useState, useEffect } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import '../../styles/HoDPendingRequests.css';

const HoDPendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const token = localStorage.getItem('token');
      // const response = await fetch('http://localhost:5000/api/hod/pending-requests', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setRequests(data.requests);
      
      // Mock data for now
      setRequests([
        {
          _id: '1',
          employee: { name: 'John Doe', email: 'john@example.com' },
          leaveType: 'Annual Leave',
          startDate: '2025-12-25',
          endDate: '2025-12-27',
          duration: 3,
          reason: 'Family vacation',
          status: 'Pending',
          submittedAt: '2025-12-18'
        },
        {
          _id: '2',
          employee: { name: 'Jane Smith', email: 'jane@example.com' },
          leaveType: 'Sick Leave',
          startDate: '2025-12-22',
          endDate: '2025-12-22',
          duration: 1,
          reason: 'Medical appointment',
          status: 'Pending',
          submittedAt: '2025-12-19'
        }
      ]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      // TODO: Add actual API call
      // await fetch(`http://localhost:5000/api/hod/requests/${requestId}/approve`, {
      //   method: 'PATCH',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Update local state
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status: 'Approved' } : req
      ));
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      // TODO: Add actual API call
      
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status: 'Rejected' } : req
      ));
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status.toLowerCase() === filter;
  });

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  return (
    <HoDLayout>
      <div className="hod-pending-requests-container">
        <div className="page-header">
          <h1>Pending Leave Requests</h1>
          <p className="page-subtitle">Review and manage leave requests from your department</p>
        </div>

        <RoleToggle />

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
              Pending ({requests.filter(r => r.status === 'Pending').length})
            </button>
            <button 
              className={filter === 'approved' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('approved')}
            >
              Approved ({requests.filter(r => r.status === 'Approved').length})
            </button>
            <button 
              className={filter === 'rejected' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({requests.filter(r => r.status === 'Rejected').length})
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
                    <h3>{request.employee.name}</h3>
                    <p className="employee-email">{request.employee.email}</p>
                  </div>
                  <span className={`request-status ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Leave Type:</span>
                    <span className="detail-value">{request.leaveType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{request.duration} day(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Dates:</span>
                    <span className="detail-value">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{request.reason}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {request.status === 'Pending' && (
                  <div className="request-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(request._id)}
                      disabled={processingRequestId === request._id}
                    >
                      {processingRequestId === request._id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(request._id)}
                      disabled={processingRequestId === request._id}
                    >
                      {processingRequestId === request._id ? 'Processing...' : '✗ Reject'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </HoDLayout>
  );
};

export default HoDPendingRequests;
