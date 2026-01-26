import { useState } from 'react';
import Layout from '../../components/Layout';
import { MdFilterList, MdCheckCircle, MdCancel, MdPending, MdCalendarToday, MdEvent } from 'react-icons/md';
import '../../styles/LeaveHistory.css';

const LeaveHistory = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Dummy data
  const dummyHistory = [
    {
      id: 1,
      leaveType: 'Annual',
      applicationDate: '2026-01-10',
      startDate: '2026-01-15',
      endDate: '2026-01-19',
      numberOfDays: 5,
      reason: 'Family vacation',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2026-01-11'
    },
    {
      id: 2,
      leaveType: 'Casual',
      applicationDate: '2026-01-05',
      startDate: '2026-01-08',
      endDate: '2026-01-09',
      numberOfDays: 2,
      reason: 'Personal work',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2026-01-06'
    },
    {
      id: 3,
      leaveType: 'Annual',
      applicationDate: '2025-12-20',
      startDate: '2025-12-25',
      endDate: '2025-12-29',
      numberOfDays: 5,
      reason: 'Holiday trip',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-12-21'
    },
    {
      id: 4,
      leaveType: 'Casual',
      applicationDate: '2025-12-15',
      startDate: '2025-12-18',
      endDate: '2025-12-18',
      numberOfDays: 1,
      reason: 'Doctor appointment',
      status: 'Declined',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-12-16',
      remarks: 'Please reschedule to a less busy period'
    },
    {
      id: 5,
      leaveType: 'Annual',
      applicationDate: '2025-11-28',
      startDate: '2025-12-02',
      endDate: '2025-12-06',
      numberOfDays: 5,
      reason: 'Attending conference',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-11-29'
    },
    {
      id: 6,
      leaveType: 'Casual',
      applicationDate: '2025-11-10',
      startDate: '2025-11-15',
      endDate: '2025-11-16',
      numberOfDays: 2,
      reason: 'Family emergency',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-11-11'
    },
    {
      id: 7,
      leaveType: 'Annual',
      applicationDate: '2025-10-20',
      startDate: '2025-10-25',
      endDate: '2025-10-27',
      numberOfDays: 3,
      reason: 'Personal travel',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-10-21'
    }
  ];

  const filteredHistory = dummyHistory.filter(leave => {
    const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
    const matchesType = filterType === 'All' || leave.leaveType === filterType;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: dummyHistory.length,
    approved: dummyHistory.filter(l => l.status === 'Approved').length,
    declined: dummyHistory.filter(l => l.status === 'Declined').length,
    totalDays: dummyHistory.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.numberOfDays, 0)
  };

  return (
    <Layout>
      <div className="history-container">
        <div className="history-header">
          <h1>Leave History</h1>
          <p className="history-subtitle">View all your past leave applications</p>
        </div>

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
              <div className="empty-icon">📭</div>
              <p>No leave history found</p>
              <p className="empty-subtitle">Try adjusting your filters</p>
            </div>
          ) : (
            filteredHistory.map(leave => (
              <div key={leave.id} className="history-card">
                <div className="history-card-header">
                  <div className="leave-info">
                    <span className={`leave-type-badge type-${leave.leaveType.toLowerCase()}`}>
                      {leave.leaveType}
                    </span>
                    <span className={`status-badge-history status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="history-actions">
                    <div className="leave-dates">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                    <button
                      type="button"
                      className="history-delete-btn"
                      onClick={(e) => e.preventDefault()}
                      aria-label="Delete (dummy button)"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="history-card-body">
                  <div className="history-detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{leave.numberOfDays} day{leave.numberOfDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="history-detail">
                    <span className="detail-label">Application Date:</span>
                    <span className="detail-value">{new Date(leave.applicationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="history-detail">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{leave.reason}</span>
                  </div>
                  {leave.status === 'Approved' && (
                    <>
                      <div className="history-detail">
                        <span className="detail-label">Approved By:</span>
                        <span className="detail-value">{leave.approvedBy}</span>
                      </div>
                      <div className="history-detail">
                        <span className="detail-label">Approved Date:</span>
                        <span className="detail-value">{new Date(leave.approvedDate).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                  {leave.status === 'Declined' && leave.remarks && (
                    <div className="history-detail remarks">
                      <span className="detail-label">Remarks:</span>
                      <span className="detail-value">{leave.remarks}</span>
                    </div>
                  )}
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
