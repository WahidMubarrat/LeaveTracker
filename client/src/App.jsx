import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/EmployeePages/Profile';
import Members from './pages/EmployeePages/Members';
import LeaveHistory from './pages/EmployeePages/LeaveHistory';
import LeaveApplication from './pages/EmployeePages/LeaveApplication';
import ApplicationStatus from './pages/EmployeePages/ApplicationStatus';
import AlternateRequests from './pages/EmployeePages/AlternateRequests';
import SystemSettings from './pages/HRPages/SystemSettings';
import HRReviewApplication from './pages/HRPages/ReviewApplication';
import SystemMembers from './pages/HRPages/SystemMembers';
import HRLeaveAnalytics from './pages/HRPages/LeaveAnalytics';
import HoDDashboard from './pages/HoDPages/HoDDashboard';
import HoDPendingRequests from './pages/HoDPages/HoDPendingRequests';
import HoDDepartmentMembers from './pages/HoDPages/HoDDepartmentMembers';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'HoD']}>
                <Profile />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'HoD']}>
                <Members />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/leave-history"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'HoD']}>
                <LeaveHistory />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/leave-application"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'HoD']}>
                <LeaveApplication />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/application-status"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'HoD']}>
                <ApplicationStatus />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/alternate-requests"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'HoD']}>
                <AlternateRequests />
              </RoleBasedRoute>
            }
          />
          {/* HR Routes */}
          <Route
            path="/hr/system-settings"
            element={
              <RoleBasedRoute allowedRoles={['HR']}>
                <SystemSettings />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/hr/review-application"
            element={
              <RoleBasedRoute allowedRoles={['HR']}>
                <HRReviewApplication />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/hr/system-members"
            element={
              <RoleBasedRoute allowedRoles={['HR']}>
                <SystemMembers />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/hr/leave-analytics"
            element={
              <RoleBasedRoute allowedRoles={['HR']}>
                <HRLeaveAnalytics />
              </RoleBasedRoute>
            }
          />
          {/* HoD Routes */}
          <Route
            path="/hod/dashboard"
            element={
              <RoleBasedRoute allowedRoles={['HoD']}>
                <HoDDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/hod/pending-requests"
            element={
              <RoleBasedRoute allowedRoles={['HoD']}>
                <HoDPendingRequests />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/hod/department-members"
            element={
              <RoleBasedRoute allowedRoles={['HoD']}>
                <HoDDepartmentMembers />
              </RoleBasedRoute>
            }
          />
          {/* Redirect old dashboard route to profile */}
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;