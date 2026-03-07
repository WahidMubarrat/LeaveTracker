import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import '../styles/HRNavbar.css';

const departmentConfig = [
  { code: 'CSE', name: 'Computer Science & Engineering', color: '#2196F3', textColor: '#fff' },
  { code: 'EEE', name: 'Electrical & Electronic Engineering', color: '#FFD700', textColor: '#000' },
  { code: 'CEE', name: 'Civil & Environmental Engineering', color: '#4CAF50', textColor: '#fff' },
  { code: 'MPE', name: 'Mechanical & Production Engineering', color: '#f44336', textColor: '#fff' },
  { code: 'BTM', name: 'Business & Technology Management', color: '#9C27B0', textColor: '#fff' },
  { code: 'TVE', name: 'Technical & Vocational Education', color: '#FF9800', textColor: '#fff' }
];

const HRNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);

  const isEmployeesPage = location.pathname === '/hr/employees';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEmployeesClick = () => {
    setEmpDropdownOpen(prev => !prev);
  };

  const handleDeptClick = (deptCode) => {
    navigate('/hr/employees', { state: { departmentCode: deptCode } });
    setIsOpen(false);
  };

  return (
    <>
      <button className="hr-hamburger-btn" onClick={() => setIsOpen(true)}>☰</button>
      {isOpen && <div className="hr-nav-overlay" onClick={() => setIsOpen(false)} />}
      <div className={`hr-navbar${isOpen ? ' open' : ''}`}>
      <div className="hr-navbar-header">
        <h2>HR Dashboard</h2>
        <div className="hr-user-info">
          <span className="hr-user-name">{user?.name}</span>
          <span className="hr-user-role">{user?.role}</span>
        </div>
      </div>

      <nav className="hr-nav-menu">
        <NavLink
          to="/hr/dashboard"
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
          onClick={() => setIsOpen(false)}
        >
          <span className="hr-nav-icon">📊</span>
          <span className="hr-nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/hr/system-settings"
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
          onClick={() => setIsOpen(false)}
        >
          <span className="hr-nav-icon">⚙️</span>
          <span className="hr-nav-text">System Settings</span>
        </NavLink>

        <NavLink
          to="/hr/review-application"
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
          onClick={() => setIsOpen(false)}
        >
          <span className="hr-nav-icon">📋</span>
          <span className="hr-nav-text">Review Application</span>
        </NavLink>

        {/* Employees with department dropdown */}
        <div className="hr-nav-dropdown-wrapper">
          <div
            className={`hr-nav-link hr-nav-dropdown-trigger ${isEmployeesPage ? 'active' : ''}`}
            onClick={handleEmployeesClick}
          >
            <span className="hr-nav-icon">👥</span>
            <span className="hr-nav-text">Employees</span>
            <span className="hr-nav-dropdown-arrow">
              {empDropdownOpen ? <MdExpandLess /> : <MdExpandMore />}
            </span>
          </div>
          {empDropdownOpen && (
            <div className="hr-nav-dropdown-menu">
              {departmentConfig.map(dept => (
                <button
                  key={dept.code}
                  className="hr-nav-dropdown-dept-btn"
                  onClick={() => handleDeptClick(dept.code)}
                >
                  <span
                    className="hr-nav-dept-dot"
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="hr-nav-dept-label">{dept.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/hr/leave-analytics"
          className={({ isActive }) => isActive ? 'hr-nav-link active' : 'hr-nav-link'}
          onClick={() => setIsOpen(false)}
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
    </>
  );
};

export default HRNavbar;
