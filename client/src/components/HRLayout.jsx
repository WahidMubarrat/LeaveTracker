import HRNavbar from './HRNavbar';
import '../styles/HRLayout.css';

const HRLayout = ({ children }) => {
  return (
    <div className="hr-layout">
      <HRNavbar />
      <div className="hr-content">
        {children}
      </div>
    </div>
  );
};

export default HRLayout;
