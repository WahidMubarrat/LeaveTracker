import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';
import '../../styles/AlternateRequests.css';

const AlternateRequests = () => {
  const [alternateRequests, setAlternateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchAlternateRequests();
  }, []);

  const fetchAlternateRequests = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getAlternateRequests();
      setAlternateRequests(response.data.alternateRequests || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch alternate requests');
      console.error('Error fetching alternate requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (alternateRequestId, response) => {
    try {
      setRespondingTo(alternateRequestId);
      await leaveAPI.respondToAlternateRequest(alternateRequestId, response);
      
      // Remove the responded request from the list
      setAlternateRequests(prev => 
        prev.filter(req => req._id !== alternateRequestId)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to request');
      console.error('Error responding to alternate request:', err);
    } finally {
      setRespondingTo(null);
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

  if (loading) {
    return (
      <Layout>
        <div className="alternate-requests-page">
          <header className="alternate-requests-header">
            <h1>Alternate Requests</h1>
            <p className="alternate-requests-subtitle">Loading requests...</p>
          </header>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="alternate-requests-page">
        <header className="alternate-requests-header">
          <h1>Alternate Requests</h1>
          <p className="alternate-requests-subtitle">
            Respond to leave alternate requests from your colleagues
          </p>
        </header>

        {error && <div className="alternate-requests-error">{error}</div>}

        {alternateRequests.length === 0 ? (
          <div className="alternate-requests-placeholder">
            <div className="placeholder-icon">📭</div>
            <h2>No Pending Requests</h2>
            <p>You don't have any pending alternate requests at the moment.</p>
          </div>
        ) : (
          <div className="alternate-requests-list">
            {alternateRequests.map((request) => (
              <div key={request._id} className="alternate-request-card">
                <div className="alternate-request-header">
                  <div className="alternate-request-info">
                    <h3>
                      {request.applicant?.name || 'Unknown'} has requested you as alternate
                    </h3>
                    <p className="alternate-request-applicant">
                      {request.leaveRequest?.applicantDesignation || ''}
                    </p>
                  </div>
                </div>

                <div className="alternate-request-details">
                  <div className="detail-row">
                    <span className="detail-label">Leave Type:</span>
                    <span className="detail-value">
                      {request.leaveRequest?.type || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">From:</span>
                    <span className="detail-value">
                      {formatDate(request.leaveRequest?.startDate)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">To:</span>
                    <span className="detail-value">
                      {formatDate(request.leaveRequest?.endDate)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Number of Days:</span>
                    <span className="detail-value">
                      {request.leaveRequest?.numberOfDays || 'N/A'} day(s)
                    </span>
                  </div>
                  {request.leaveRequest?.reason && (
                    <div className="detail-row">
                      <span className="detail-label">Reason:</span>
                      <span className="detail-value">
                        {request.leaveRequest.reason}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Requested On:</span>
                    <span className="detail-value">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="alternate-request-actions">
                  <button
                    className="btn-alternate-ok"
                    onClick={() => handleRespond(request._id, 'ok')}
                    disabled={respondingTo === request._id}
                  >
                    {respondingTo === request._id ? 'Processing...' : '✓ OK'}
                  </button>
                  <button
                    className="btn-alternate-sorry"
                    onClick={() => handleRespond(request._id, 'sorry')}
                    disabled={respondingTo === request._id}
                  >
                    {respondingTo === request._id ? 'Processing...' : '✗ Sorry'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AlternateRequests;
