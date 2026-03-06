import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/HoDNavbar.css';

const HoDNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button className="hod-hamburger-btn" onClick={() => setIsOpen(true)}>☰</button>
      {isOpen && <div className="hod-nav-overlay" onClick={() => setIsOpen(false)} />}
      <div className={`hod-navbar${isOpen ? ' open' : ''}`}>
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
          onClick={() => setIsOpen(false)}
        >
          <span className="hod-nav-icon">📊</span>
          <span className="hod-nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/hod/pending-requests"
          className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
          onClick={() => setIsOpen(false)}
        >
          <span className="hod-nav-icon">📋</span>
          <span className="hod-nav-text">Pending Requests</span>
        </NavLink>

        <NavLink
          to="/hod/department-members"
          className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
          onClick={() => setIsOpen(false)}
        >
          <span className="hod-nav-icon">👥</span>
          <span className="hod-nav-text">Department Members</span>
        </NavLink>

        <NavLink
          to="/hod/analytics"
          className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
          onClick={() => setIsOpen(false)}
        >
          <span className="hod-nav-icon">📈</span>
          <span className="hod-nav-text">Analytics</span>
        </NavLink>
      </nav>

      <div className="hod-navbar-footer">
        <button className="hod-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
    </>
  );
};

export default HoDNavbar;
