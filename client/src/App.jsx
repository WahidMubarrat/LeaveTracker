import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Members from './pages/Members';
import LeaveHistory from './pages/LeaveHistory';
import LeaveApplication from './pages/LeaveApplication';
import ApplicationStatus from './pages/ApplicationStatus';
import AlternateRequests from './pages/AlternateRequests';
import ProtectedRoute from './components/ProtectedRoute';
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
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-history"
            element={
              <ProtectedRoute>
                <LeaveHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-application"
            element={
              <ProtectedRoute>
                <LeaveApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-status"
            element={
              <ProtectedRoute>
                <ApplicationStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alternate-requests"
            element={
              <ProtectedRoute>
                <AlternateRequests />
              </ProtectedRoute>
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
