import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/HRNavbar.css';

const HRNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hr-navbar">
      <div className="hr-navbar-header">
        <h2>HR Dashboard</h2>
        <div className="hr-user-info">
          <span className="hr-user-name">{user?.name}</span>
          <span className="hr-user-role">{user?.role}</span>
        </div>
      </div>

      <nav className="hr-nav-menu">
        <NavLink 
          to="/hr/system-settings" 
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
        >
          <span className="hr-nav-icon">⚙️</span>
          <span className="hr-nav-text">System Settings</span>
        </NavLink>

        <NavLink 
          to="/hr/review-application" 
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
        >
          <span className="hr-nav-icon">📋</span>
          <span className="hr-nav-text">Review Application</span>
        </NavLink>

        <NavLink 
          to="/hr/system-members" 
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
        >
          <span className="hr-nav-icon">👥</span>
          <span className="hr-nav-text">System Members</span>
        </NavLink>

        <NavLink 
          to="/hr/leave-analytics" 
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
        >
          <span className="hr-nav-icon">📊</span>
          <span className="hr-nav-text">Leave Analytics</span>
        </NavLink>
      </nav>

      <div className="hr-navbar-footer">
        <button className="hr-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default HRNavbar;
