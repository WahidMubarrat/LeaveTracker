import { useContext, useState, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { userAPI } from '../services/api';
import '../styles/PersonalInfo.css';

const PersonalInfo = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    designation: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  const handleEditClick = useCallback(() => {
    setEditData({
      name: user.name,
      designation: user.designation || '',
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
  }, [user.name, user.designation]);

  const handleCancelClick = useCallback(() => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  }, []);

  const handleChange = useCallback((e) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSaveClick = useCallback(async () => {
    setError('');
    setSuccess('');

    if (!editData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await userAPI.updateProfile(editData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [editData, setUser]);

  const handlePasswordChange = useCallback(async (passwordData) => {
    try {
      const response = await userAPI.changePassword(passwordData);
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to change password',
      };
    }
  }, []);

  const memberSince = useMemo(() => {
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [user.createdAt]);

  return (
    <div className="personal-info-container">
      <div className="profile-header-section">
        <div className="profile-image-wrapper">
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-header-details">
          <h2 className="profile-name">{user.name}</h2>
          <span className="profile-role-badge">{user.role}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="personal-info-section">
        <div className="section-header">
          <h3 className="section-title">Personal Information</h3>
          <div className="section-actions">
            {!isEditing ? (
              <>
                <button className="btn-edit" onClick={handleEditClick}>
                  ✏️ Edit Profile
                </button>
                <button 
                  className="btn-change-password" 
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  🔒 Change Password
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn-cancel" 
                  onClick={handleCancelClick}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleSaveClick}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label className="info-label">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="info-input"
                placeholder="Enter your name"
              />
            ) : (
              <p className="info-value">{user.name}</p>
            )}
          </div>
          
          <div className="info-item">
            <label className="info-label">Email Address</label>
            <p className="info-value">{user.email}</p>
          </div>
          
          <div className="info-item">
            <label className="info-label">Designation</label>
            {isEditing ? (
              <select
                name="designation"
                value={editData.designation}
                onChange={handleChange}
                className="info-input"
              >
                <option value="">Select Designation</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
              </select>
            ) : (
              <p className="info-value">{user.designation || 'Not Set'}</p>
            )}
          </div>
          
          <div className="info-item">
            <label className="info-label">Role</label>
            <p className="info-value">{user.role}</p>
          </div>
          
          <div className="info-item">
            <label className="info-label">Department</label>
            <p className="info-value">{user.department?.name || 'Not Assigned'}</p>
          </div>
          
          <div className="info-item">
            <label className="info-label">Member Since</label>
            <p className="info-value">{memberSince}</p>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordChange={handlePasswordChange}
      />
    </div>
  );
};

export default PersonalInfo;
