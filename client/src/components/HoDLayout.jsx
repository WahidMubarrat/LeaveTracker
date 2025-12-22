import PropTypes from 'prop-types';
import HoDNavbar from './HoDNavbar';
import '../styles/HoDLayout.css';

const HoDLayout = ({ children }) => {
  return (
    <div className="hod-layout">
      <HoDNavbar />
      <div className="hod-content">
        {children}
      </div>
    </div>
  );
};

HoDLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HoDLayout;
