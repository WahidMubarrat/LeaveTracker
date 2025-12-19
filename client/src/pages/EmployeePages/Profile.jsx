import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import LeaveData from '../../components/LeaveData';
import PersonalInfo from '../../components/PersonalInfo';
import '../../styles/Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Layout>
        <div className="loading-container">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your personal information and leave balance</p>
        </div>

        <div className="profile-content">
          <PersonalInfo />
          <LeaveData />
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
