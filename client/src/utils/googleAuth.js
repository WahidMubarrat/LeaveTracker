// Google OAuth configuration and helpers

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const googleAuthConfig = {
  authUrl: `${API_URL}/api/auth/google`,
};

// Initiate Google OAuth login
export const handleGoogleLogin = () => {
  console.log('handleGoogleLogin called');
  console.log('Redirecting to:', googleAuthConfig.authUrl);
  window.location.href = googleAuthConfig.authUrl;
};

// Extract token from URL query params (after OAuth callback redirect)
export const getTokenFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
};

// Clear token from URL without page reload
export const clearTokenFromURL = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('token');
  window.history.replaceState({}, document.title, url.pathname);
};
