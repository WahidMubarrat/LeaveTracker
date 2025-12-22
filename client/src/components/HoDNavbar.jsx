import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/HoDNavbar.css';

const HoDNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hod-navbar">
      <div className="hod-navbar-header">
        <h2>HoD Panel</h2>
        <div className="hod-user-info">
          <span className="hod-user-name">{user?.name}</span>
          <span className="hod-user-role">Head of Department</span>
        </div>
      </div>

      <nav className="hod-nav-menu">
        <NavLink 
          to="/hod/dashboard" 
          className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
        >
          <span className="hod-nav-icon">📊</span>
          <span className="hod-nav-text">Dashboard</span>
        </NavLink>

        <NavLink 
          to="/hod/pending-requests" 
          className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
        >
          <span className="hod-nav-icon">📋</span>
          <span className="hod-nav-text">Pending Requests</span>
        </NavLink>

        <NavLink 
          to="/hod/department-members" 
          className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
        >
          <span className="hod-nav-icon">👥</span>
          <span className="hod-nav-text">Department Members</span>
        </NavLink>
      </nav>

      <div className="hod-navbar-footer">
        <button className="hod-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default HoDNavbar;
