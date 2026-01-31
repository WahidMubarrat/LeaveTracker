import PropTypes from 'prop-types';
import '../styles/WarningTooltip.css';

const WarningTooltip = ({ message, show }) => {
  if (!show || !message) return null;

  return (
    <div className="warning-tooltip">
      ⚠️ {message}
    </div>
  );
};

WarningTooltip.propTypes = {
  message: PropTypes.string,
  show: PropTypes.bool
};

WarningTooltip.defaultProps = {
  message: '',
  show: false
};

export default WarningTooltip;
