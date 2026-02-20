import { Link } from 'react-router-dom';
import { MdNotificationsActive, MdArrowForward } from 'react-icons/md';

const HRNotification = ({ pendingRequest, totalCount }) => {
    return (
        <div className="hr-notification-card">
            <div className="notification-header">
                <MdNotificationsActive className="notification-icon" />
                <h3>Notifications</h3>
                {totalCount > 0 && <span className="notification-badge">{totalCount}</span>}
            </div>

            <div className="notification-content">
                {pendingRequest ? (
                    <div className="notification-item">
                        <p className="notification-text">
                            You have new request from <strong>{pendingRequest.employee?.name}</strong>,
                            {" "}{pendingRequest.employee?.designation} ({pendingRequest.department?.name}).
                        </p>
                        <Link to="/hr/review-application" className="notification-link">
                            Click here for more details <MdArrowForward />
                        </Link>
                    </div>
                ) : (
                    <div className="no-notification">
                        <p>No pending request</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRNotification;
