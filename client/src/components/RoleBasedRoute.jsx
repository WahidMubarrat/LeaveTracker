import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
    // Redirect based on their highest priority role (HR > HoD > Employee)
    if (user.roles.includes('HR')) {
      return <Navigate to="/hr/system-settings" replace />;
    } else if (user.roles.includes('HoD')) {
      return <Navigate to="/hod/dashboard" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};

export default RoleBasedRoute;
