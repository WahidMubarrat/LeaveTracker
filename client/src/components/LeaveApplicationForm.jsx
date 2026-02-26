import React from 'react';
import PropTypes from 'prop-types';

const LeaveApplicationForm = ({ leaveDetails, memberName, formatDate, isHistory = false, showHeader = true }) => {
    if (!leaveDetails) {
        return (
            <div className="empty-modal-state">
                <p>{isHistory ? 'Record details unavailable.' : 'No active leave application found for this member.'}</p>
            </div>
        );
    }

    return (
        <div className={`form-container ${isHistory ? 'embedded-form' : ''}`}>
            {showHeader && (
                <div className="form-header-banner">
                    <span className="form-title">{isHistory ? 'PAST LEAVE FORM' : 'ACTIVE LEAVE FORM'}</span>
                </div>
            )}

            <div className="form-section">
                <h4 className="section-title">Employee Information</h4>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Applicant Name</label>
                        <div className="value">{memberName || leaveDetails.applicantName || leaveDetails.employee?.name}</div>
                    </div>
                    <div className="form-field">
                        <label>Designation</label>
                        <div className="value">{leaveDetails.applicantDesignation || 'N/A'}</div>
                    </div>
                    <div className="form-field">
                        <label>Department</label>
                        <div className="value">{leaveDetails.departmentName || leaveDetails.department?.name || 'N/A'}</div>
                    </div>
                    <div className="form-field">
                        <label>Submission Date</label>
                        <div className="value">{formatDate(leaveDetails.applicationDate || leaveDetails.createdAt)}</div>
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h4 className="section-title">Leave Details</h4>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Type of Leave</label>
                        <div className="value highlight-text">{leaveDetails.type} Leave</div>
                    </div>
                    <div className="form-field">
                        <label>Total Duration</label>
                        <div className="value">{leaveDetails.numberOfDays} Day(s)</div>
                    </div>
                    <div className="form-field">
                        <label>Start Date</label>
                        <div className="value">{formatDate(leaveDetails.startDate)}</div>
                    </div>
                    <div className="form-field">
                        <label>End Date</label>
                        <div className="value">{formatDate(leaveDetails.endDate)}</div>
                    </div>
                </div>
                <div className="form-field full-width">
                    <label>Purpose / Reason for Leave</label>
                    <div className="value reason-box">{leaveDetails.reason || 'No reason provided'}</div>
                </div>
            </div>

            {leaveDetails.alternateEmployees && leaveDetails.alternateEmployees.length > 0 && (
                <div className="form-section">
                    <h4 className="section-title">Work Coverage Plan</h4>
                    <div className="alternate-form-list">
                        {leaveDetails.alternateEmployees.map((alt, index) => (
                            <div key={index} className="alternate-form-row">
                                <span className="alt-label">Alternate {index + 1}:</span>
                                <span className="alt-value">{alt.employee?.name || 'Unknown'}</span>
                                <span className={`alt-status-tag ${alt.response}`}>
                                    {alt.response === 'ok' ? 'CONSENTED' : alt.response === 'sorry' ? 'DECLINED' : 'PENDING'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {leaveDetails.leaveDocument && (
                <div className="form-section">
                    <h4 className="section-title">Supporting Documents</h4>
                    <div className="form-document-box">
                        <a href={leaveDetails.leaveDocument} target="_blank" rel="noopener noreferrer">
                            <img src={leaveDetails.leaveDocument} alt="Leave Document" />
                        </a>
                        <p className="document-hint">Click image to view full size</p>
                    </div>
                </div>
            )}

            <div className="form-section approval-section">
                <h4 className="section-title">Status & Remarks</h4>
                <div className="approval-grid">
                    <div className="approval-column">
                        <div className="form-field">
                            <label>HOD Status</label>
                            <div className={`value ${leaveDetails.status === 'Approved' || leaveDetails.approvedByHoD ? 'status-text-approved' : leaveDetails.status === 'Declined' ? 'status-text-declined' : 'status-text-pending'}`}>
                                {leaveDetails.status === 'Approved' ? 'Approved' :
                                    leaveDetails.status === 'Declined' ? 'Declined' :
                                        leaveDetails.approvedByHoD ? 'Verified' : 'Pending Review'}
                            </div>
                        </div>
                        {leaveDetails.hodRemarks && (
                            <div className="form-field remarks-field">
                                <label>HOD Remarks</label>
                                <div className="value-remarks">{leaveDetails.hodRemarks}</div>
                            </div>
                        )}
                    </div>

                    <div className="approval-column">
                        <div className="form-field">
                            <label>HR Status</label>
                            <div className={`value ${leaveDetails.status === 'Approved' || leaveDetails.approvedByHR ? 'status-text-approved' : leaveDetails.status === 'Declined' ? 'status-text-declined' : 'status-text-pending'}`}>
                                {leaveDetails.status === 'Approved' ? 'Approved' :
                                    leaveDetails.status === 'Declined' ? 'Declined' :
                                        leaveDetails.approvedByHR ? 'Approved' : 'Final Verification'}
                            </div>
                        </div>
                        {leaveDetails.hrRemarks && (
                            <div className="form-field remarks-field">
                                <label>HR Remarks</label>
                                <div className="value-remarks">{leaveDetails.hrRemarks}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

LeaveApplicationForm.propTypes = {
    leaveDetails: PropTypes.object,
    memberName: PropTypes.string,
    formatDate: PropTypes.func.isRequired,
    isHistory: PropTypes.bool,
    showHeader: PropTypes.bool
};

export default LeaveApplicationForm;
