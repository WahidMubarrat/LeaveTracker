import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/members', label: 'Members', icon: '👥' },
    { path: '/leave-history', label: 'Leave History', icon: '📋' },
    { path: '/leave-application', label: 'Apply Leave', icon: '📝' },
    { path: '/application-status', label: 'Application Status', icon: '📊' },
    { path: '/alternate-requests', label: 'Alternate Requests', icon: '🔄' },
  ];

  return (
    <div className="navbar-container">
      <div className="navbar-header">
        <h2 className="navbar-logo">LeaveTracker</h2>
        <div className="navbar-user">
          {user?.profilePic ? (
            <img src={user.profilePic} alt={user.name} className="navbar-avatar" />
          ) : (
            <div className="navbar-avatar-placeholder">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="navbar-user-info">
            <p className="navbar-user-name">{user?.name}</p>
            <p className="navbar-user-role">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="navbar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
            }
          >
            <span className="navbar-icon">{item.icon}</span>
            <span className="navbar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="navbar-footer">
        <button onClick={handleLogout} className="navbar-logout-btn">
          <span className="navbar-icon">🚪</span>
          <span className="navbar-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
