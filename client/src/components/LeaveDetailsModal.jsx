import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';
import { userAPI, leaveAPI } from '../services/api';
import LeaveApplicationForm from './LeaveApplicationForm';
import '../styles/LeaveDetailsModal.css';

// --- Sub-component: Leave History List (Expandable) ---
const LeaveHistoryContent = ({ history, formatDate, memberName }) => {
    const [expandedId, setExpandedId] = useState(null);

    if (!history || history.length === 0) {
        return (
            <div className="empty-modal-state">
                <p>No leave history records found for this member.</p>
            </div>
        );
    }

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="modal-history-list">
            <h4 className="section-title history-title">Past Leave Records</h4>
            {history.map((record) => (
                <div
                    key={record._id}
                    className={`modal-history-card-expandable ${expandedId === record._id ? 'expanded' : ''}`}
                >
                    <div className="modal-history-header" onClick={() => toggleExpand(record._id)}>
                        <div className="modal-history-main">
                            <div className="modal-history-info">
                                <span className={`modal-type-badge type-${record.type.toLowerCase()}`}>
                                    {record.type}
                                </span>
                                <span className={`modal-status-badge status-${record.status.toLowerCase()}`}>
                                    {record.status}
                                </span>
                            </div>
                            <div className="modal-history-dates">
                                {formatDate(record.startDate)} — {formatDate(record.endDate)}
                                <span className="modal-days">({record.numberOfDays} days)</span>
                            </div>
                        </div>
                        <span className={`modal-expand-icon ${expandedId === record._id ? 'rotated' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </span>
                    </div>

                    <div className={`modal-history-body ${expandedId === record._id ? 'visible' : ''}`}>
                        <div className="modal-embedded-form-wrapper">
                            <LeaveApplicationForm
                                leaveDetails={record}
                                memberName={memberName}
                                formatDate={formatDate}
                                isHistory={true}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LeaveDetailsModal = ({ userId, memberName, onClose, initialOnLeave }) => {
    const [leaveDetails, setLeaveDetails] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(initialOnLeave ? 'current' : 'history');

    useEffect(() => {
        fetchAllData();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [userId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [leaveRes, historyRes] = await Promise.allSettled([
                userAPI.getActiveLeaveDetails(userId),
                leaveAPI.getMemberHistory(userId)
            ]);

            if (leaveRes.status === 'fulfilled') {
                setLeaveDetails(leaveRes.value.data.leaveDetails);
            }

            if (historyRes.status === 'fulfilled') {
                setHistory(historyRes.value.data.applications || []);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching modal data:', err);
            setError('Failed to load member data.');
        } finally {
            setLoading(false);
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

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalContent = (
        <div className="leave-modal-overlay" onClick={handleOverlayClick}>
            <div className="leave-modal-container">
                <div className="leave-modal-header">
                    <div className="modal-header-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                            onClick={() => setActiveTab('current')}
                        >
                            Active Leave
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </button>
                    </div>
                    <button className="leave-modal-close" onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className="leave-modal-body">
                    {loading ? (
                        <div className="leave-modal-loading">
                            <div className="loading-spinner"></div>
                            <p>Fetching member data...</p>
                        </div>
                    ) : error ? (
                        <div className="leave-modal-error">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="modal-tab-content">
                            {activeTab === 'current' ? (
                                <LeaveApplicationForm
                                    leaveDetails={leaveDetails}
                                    memberName={memberName}
                                    formatDate={formatDate}
                                />
                            ) : (
                                <LeaveHistoryContent
                                    history={history}
                                    formatDate={formatDate}
                                    memberName={memberName}
                                />
                            )}
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
    initialOnLeave: PropTypes.bool
};

export default LeaveDetailsModal;
