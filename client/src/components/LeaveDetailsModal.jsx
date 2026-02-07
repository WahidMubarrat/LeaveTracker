import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { MdClose, MdCalendarToday, MdPerson, MdDescription, MdAttachFile, MdAccessTime } from 'react-icons/md';
import { userAPI } from '../services/api';
import '../styles/LeaveDetailsModal.css';

const LeaveDetailsModal = ({ userId, memberName, onClose }) => {
    const [leaveDetails, setLeaveDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaveDetails();
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [userId]);

    const fetchLeaveDetails = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getActiveLeaveDetails(userId);
            setLeaveDetails(response.data.leaveDetails);
            setError(null);
        } catch (err) {
            console.error('Error fetching leave details:', err);
            setError('Failed to load leave details.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalContent = (
        <div className="leave-modal-overlay" onClick={handleOverlayClick}>
            <div className="leave-modal-container">
                <div className="leave-modal-header">
                    <h2>Leave Details</h2>
                    <button className="leave-modal-close" onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className="leave-modal-body">
                    {loading ? (
                        <div className="leave-modal-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading leave details...</p>
                        </div>
                    ) : error ? (
                        <div className="leave-modal-error">
                            <p>{error}</p>
                        </div>
                    ) : leaveDetails ? (
                        <div className="leave-details-content">
                            {/* Employee Info */}
                            <div className="leave-detail-section employee-section">
                                <div className="employee-avatar-large">
                                    {leaveDetails.employee?.profilePic ? (
                                        <img src={leaveDetails.employee.profilePic} alt={memberName} />
                                    ) : (
                                        <span>{memberName?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="employee-info-text">
                                    <h3>{memberName || leaveDetails.applicantName}</h3>
                                    <p>{leaveDetails.applicantDesignation}</p>
                                    <span className="department-tag">{leaveDetails.department?.name || leaveDetails.departmentName}</span>
                                </div>
                            </div>

                            {/* Leave Type Badge */}
                            <div className="leave-type-section">
                                <span className={`leave-type-badge ${leaveDetails.type?.toLowerCase()}`}>
                                    {leaveDetails.type} Leave
                                </span>
                                <span className="leave-days-badge">
                                    {leaveDetails.numberOfDays} {leaveDetails.numberOfDays === 1 ? 'Day' : 'Days'}
                                </span>
                            </div>

                            {/* Date Section */}
                            <div className="leave-detail-section">
                                <div className="section-header">
                                    <MdCalendarToday className="section-icon" />
                                    <h4>Leave Period</h4>
                                </div>
                                <div className="date-range">
                                    <div className="date-item">
                                        <span className="date-label">From</span>
                                        <span className="date-value">{formatDate(leaveDetails.startDate)}</span>
                                    </div>
                                    <div className="date-separator">→</div>
                                    <div className="date-item">
                                        <span className="date-label">To</span>
                                        <span className="date-value">{formatDate(leaveDetails.endDate)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Application Date */}
                            <div className="leave-detail-section">
                                <div className="section-header">
                                    <MdAccessTime className="section-icon" />
                                    <h4>Application Date</h4>
                                </div>
                                <p className="detail-text">{formatDate(leaveDetails.applicationDate)}</p>
                            </div>

                            {/* Purpose Section */}
                            {leaveDetails.reason && (
                                <div className="leave-detail-section">
                                    <div className="section-header">
                                        <MdDescription className="section-icon" />
                                        <h4>Purpose of Leave</h4>
                                    </div>
                                    <p className="detail-text purpose-text">{leaveDetails.reason}</p>
                                </div>
                            )}

                            {/* Alternate Employees */}
                            {leaveDetails.alternateEmployees && leaveDetails.alternateEmployees.length > 0 && (
                                <div className="leave-detail-section">
                                    <div className="section-header">
                                        <MdPerson className="section-icon" />
                                        <h4>Alternate Employee(s)</h4>
                                    </div>
                                    <div className="alternate-list">
                                        {leaveDetails.alternateEmployees.map((alt, idx) => (
                                            <div key={idx} className="alternate-item">
                                                <span className="alternate-name">{alt.employee?.name || 'Unknown'}</span>
                                                <span className={`alternate-response ${alt.response}`}>
                                                    {alt.response === 'ok' ? 'Accepted' : alt.response === 'sorry' ? 'Declined' : 'Pending'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Document Section */}
                            {leaveDetails.leaveDocument && (
                                <div className="leave-detail-section">
                                    <div className="section-header">
                                        <MdAttachFile className="section-icon" />
                                        <h4>Supporting Document</h4>
                                    </div>
                                    <div className="document-preview">
                                        <a href={leaveDetails.leaveDocument} target="_blank" rel="noopener noreferrer">
                                            <img src={leaveDetails.leaveDocument} alt="Leave Document" className="document-image" />
                                        </a>
                                        <a
                                            href={leaveDetails.leaveDocument}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-document-btn"
                                        >
                                            View Full Document
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Approval Status */}
                            <div className="leave-detail-section approval-section">
                                <h4>Approval Status</h4>
                                <div className="approval-steps">
                                    <div className={`approval-step ${leaveDetails.approvedByHoD ? 'approved' : ''}`}>
                                        <span className="step-indicator">{leaveDetails.approvedByHoD ? '✓' : '○'}</span>
                                        <span className="step-label">HoD</span>
                                    </div>
                                    <div className="approval-line"></div>
                                    <div className={`approval-step ${leaveDetails.approvedByHR ? 'approved' : ''}`}>
                                        <span className="step-indicator">{leaveDetails.approvedByHR ? '✓' : '○'}</span>
                                        <span className="step-label">HR</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="leave-modal-error">
                            <p>No leave details available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

LeaveDetailsModal.propTypes = {
    userId: PropTypes.string.isRequired,
    memberName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default LeaveDetailsModal;
