import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVpnKey, MdArrowBack } from 'react-icons/md';
import axios from 'axios';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      setSuccess(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    if (!hasUppercase || !hasLowercase) {
      setError('Password must contain both uppercase and lowercase letters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        newPassword
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>LeaveTracker</h1>
        <h2>Reset Your Password</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <p className="step-info">Enter your email address to receive a verification code</p>
            <div className="form-group">
              <label htmlFor="email"><MdEmail /> Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <MdVpnKey /> {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p className="step-info">Enter the 6-digit code sent to {email}</p>
            <div className="form-group">
              <label htmlFor="otp"><MdVpnKey /> Verification Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <MdVpnKey /> {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Request New OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p className="step-info">Create a new password for your account</p>
            <div className="form-group">
              <label htmlFor="newPassword"><MdLock /> New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword"><MdLock /> Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <MdLock /> {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <button className="back-to-login" onClick={handleBackToLogin}>
          <MdArrowBack /> Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
