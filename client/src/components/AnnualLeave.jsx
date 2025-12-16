import { memo } from 'react';
import PropTypes from 'prop-types';
import '../styles/AnnualLeave.css';

const AnnualLeave = memo(({ total, taken, remaining }) => {
  const percentage = total > 0 ? ((taken / total) * 100).toFixed(1) : 0;

  return (
    <div className="leave-card annual-leave">
      <div className="leave-card-header">
        <span className="leave-icon">🏖️</span>
        <h3>Annual Leave</h3>
      </div>
      
      <div className="leave-stats">
        <div className="leave-stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{total}</span>
          <span className="stat-unit">days</span>
        </div>
        
        <div className="leave-stat-item taken">
          <span className="stat-label">Taken</span>
          <span className="stat-value">{taken}</span>
          <span className="stat-unit">days</span>
        </div>
        
        <div className="leave-stat-item remaining">
          <span className="stat-label">Remaining</span>
          <span className="stat-value highlight">{remaining}</span>
          <span className="stat-unit">days</span>
        </div>
      </div>

      <div className="leave-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill annual" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="progress-text">{percentage}% used</span>
      </div>
    </div>
  );
});

AnnualLeave.displayName = 'AnnualLeave';

AnnualLeave.propTypes = {
  total: PropTypes.number.isRequired,
  taken: PropTypes.number.isRequired,
  remaining: PropTypes.number.isRequired,
};

export default AnnualLeave;
