import PropTypes from 'prop-types';
import '../styles/Status.css';

const Status = ({ currentStatus, returnDate }) => {
  const isOnLeave = currentStatus === 'On Leave';
  
  const formatReturnDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className={`status-badge ${isOnLeave ? 'on-leave' : 'on-duty'}`}>
      <span className="status-indicator"></span>
      <div className="status-content">
        <span className="status-text">
          {currentStatus}
        </span>
        {isOnLeave && returnDate && (
          <span className="return-date">
            Returns: {formatReturnDate(returnDate)}
          </span>
        )}
      </div>
    </div>
  );
};

Status.propTypes = {
  currentStatus: PropTypes.oneOf(['On Duty', 'On Leave']).isRequired,
  returnDate: PropTypes.string,
};

export default Status;
