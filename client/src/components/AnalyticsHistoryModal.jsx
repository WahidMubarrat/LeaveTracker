import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';
import { leaveAPI } from '../services/api';
import LeaveApplicationForm from './LeaveApplicationForm';
import '../styles/AnalyticsHistoryModal.css';

const AnalyticsHistoryModal = ({ filterType, filterParams, onClose }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchApplications();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [filterType, filterParams]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Prepare params for the API call
            const params = { ...filterParams };
            
            // Add status filter based on filterType
            if (filterType === 'approved') {
                params.status = 'Approved';
            } else if (filterType === 'declined') {
                params.status = 'Declined';
            } else if (filterType === 'pending') {
                params.status = 'Pending';
            }
            // For 'all', don't add status filter

            const response = await leaveAPI.getFilteredApplications(params);
            setApplications(response.data.applications || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load leave applications');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getFilterTitle = () => {
        switch (filterType) {
            case 'all':
                return 'All Leave Applications';
            case 'approved':
                return 'Approved Leave Applications';
            case 'declined':
                return 'Declined Leave Applications';
            case 'pending':
                return 'Pending Leave Applications';
            default:
                return 'Leave Applications';
        }
    };

    const modalContent = (
        <div className="analytics-history-modal-overlay no-print" onClick={onClose}>
            <div className="analytics-history-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="analytics-history-modal-header">
                    <h2>{getFilterTitle()}</h2>
                    <button className="analytics-history-modal-close" onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className="analytics-history-modal-body">
                    {loading ? (
                        <div className="analytics-history-loading">Loading applications...</div>
                    ) : error ? (
                        <div className="analytics-history-error">{error}</div>
                    ) : applications.length === 0 ? (
                        <div className="analytics-history-empty">
                            <p>No applications found</p>
                        </div>
                    ) : (
                        <div className="analytics-history-list">
                            {applications.map((app) => (
                                <div
                                    key={app._id}
                                    className={`analytics-history-card ${expandedId === app._id ? 'expanded' : ''}`}
                                >
                                    <div className="analytics-history-header" onClick={() => toggleExpand(app._id)}>
                                        <div className="analytics-history-main">
                                            <div className="analytics-history-employee">
                                                <span className="analytics-employee-name">{app.userId?.name || 'Unknown'}</span>
                                                {app.userId?.department && (
                                                    <span className="analytics-employee-dept">{app.userId.department.name}</span>
                                                )}
                                            </div>
                                            <div className="analytics-history-info">
                                                <span className={`analytics-type-badge type-${app.type.toLowerCase()}`}>
                                                    {app.type}
                                                </span>
                                                <span className={`analytics-status-badge status-${app.status.toLowerCase()}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <div className="analytics-history-dates">
                                                {formatDate(app.startDate)} — {formatDate(app.endDate)}
                                                <span className="analytics-days">({app.numberOfDays} days)</span>
                                            </div>
                                        </div>
                                        <span className={`analytics-expand-icon ${expandedId === app._id ? 'rotated' : ''}`}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </span>
                                    </div>

                                    <div className={`analytics-history-body ${expandedId === app._id ? 'visible' : ''}`}>
                                        <div className="analytics-embedded-form-wrapper">
                                            <LeaveApplicationForm
                                                leaveDetails={app}
                                                memberName={app.userId?.name || 'Unknown'}
                                                formatDate={formatDate}
                                                isHistory={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

AnalyticsHistoryModal.propTypes = {
    filterType: PropTypes.oneOf(['all', 'approved', 'declined', 'pending']).isRequired,
    filterParams: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
};

export default AnalyticsHistoryModal;
