import PropTypes from 'prop-types';
import './Status.css';

const Status = ({ currentStatus }) => {
  const isOnLeave = currentStatus === 'OnLeave';
  
  return (
    <div className={`status-badge ${isOnLeave ? 'on-leave' : 'on-duty'}`}>
      <span className="status-indicator"></span>
      <span className="status-text">
        {isOnLeave ? 'On Leave' : 'On Duty'}
      </span>
    </div>
  );
};

Status.propTypes = {
  currentStatus: PropTypes.oneOf(['OnDuty', 'OnLeave']).isRequired,
};

export default Status;
