import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTokenFromURL, clearTokenFromURL } from '../utils/googleAuth';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if redirected from Google OAuth with token
      const token = getTokenFromURL();
      if (token) {
        console.log('Token detected from URL, logging in...');
        setLoading(true);
        
        // Clear the token from URL immediately
        clearTokenFromURL();
        
        const result = await loginWithToken(token);
        console.log('OAuth login result:', result);
        
        if (result.success) {
          console.log('OAuth login successful, navigating to profile');
          navigate('/profile', { replace: true });
        } else {
          console.error('OAuth login failed:', result.message);
          setError(result.message || 'Google authentication failed');
        }
        setLoading(false);
      }
    };
    
    handleOAuthCallback();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>LeaveTracker</h1>
        <h2>Login to Your Account</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
