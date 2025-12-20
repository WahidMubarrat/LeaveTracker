import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/RoleToggle.css';

const RoleToggle = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current panel based on URL
  const getCurrentPanel = () => {
    if (location.pathname.startsWith('/hr/')) return 'HR';
    if (location.pathname.startsWith('/hod/')) return 'HoD';
    return 'Employee';
  };

  const [currentPanel, setCurrentPanel] = useState(getCurrentPanel());

  // Only show toggle if user has multiple roles
  if (!user || user.roles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (role) => {
    setCurrentPanel(role);
    
    // Navigate to appropriate dashboard
    if (role === 'HR') {
      navigate('/hr/system-settings');
    } else if (role === 'HoD') {
      navigate('/hod/dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="role-toggle">
      <div className="role-toggle-label">Switch Panel:</div>
      <div className="role-toggle-buttons">
        {user.roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`role-toggle-btn ${currentPanel === role ? 'active' : ''} ${role.toLowerCase()}`}
          >
            {role === 'HoD' ? 'Head of Dept' : role}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleToggle;
