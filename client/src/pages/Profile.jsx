import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-image-section">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <h2>{user.name}</h2>
              <p className="profile-role-badge">{user.role}</p>
            </div>

            <div className="profile-info-section">
              <h3>Personal Information</h3>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="profile-info-item">
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>
                <div className="profile-info-item">
                  <label>Designation</label>
                  <p>{user.designation}</p>
                </div>
                <div className="profile-info-item">
                  <label>Role</label>
                  <p>{user.role}</p>
                </div>
                <div className="profile-info-item">
                  <label>Department</label>
                  <p>{user.department?.name || 'Not Assigned'}</p>
                </div>
                <div className="profile-info-item">
                  <label>Member Since</label>
                  <p>{new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="profile-info-item">
                  <label>Account ID</label>
                  <p className="profile-id">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Leave Quota</h3>
            <div className="quota-grid">
              <div className="quota-card annual">
                <div className="quota-header">
                  <span className="quota-icon">🏖️</span>
                  <span className="quota-type">Annual Leave</span>
                </div>
                <div className="quota-value">{user.leaveQuota?.annual || 30}</div>
                <div className="quota-label">days available</div>
                <div className="quota-progress-bar">
                  <div className="quota-progress-fill annual" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="quota-card sick">
                <div className="quota-header">
                  <span className="quota-icon">🏥</span>
                  <span className="quota-type">Sick Leave</span>
                </div>
                <div className="quota-value">{user.leaveQuota?.sick || 10}</div>
                <div className="quota-label">days available</div>
                <div className="quota-progress-bar">
                  <div className="quota-progress-fill sick" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
