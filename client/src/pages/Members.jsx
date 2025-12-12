import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import '../styles/Members.css';

const Members = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/department-members', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="members-loading">Loading members...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="members-container">
        <div className="members-header">
          <h1>Department Members</h1>
          <p className="members-subtitle">
            {user?.department?.name} Department - {members.length} Members
          </p>
        </div>

        {error && <div className="members-error">{error}</div>}

        <div className="members-grid">
          {members.map((member) => (
            <div key={member._id} className="member-card">
              <div className="member-image-wrapper">
                {member.profilePic ? (
                  <img src={member.profilePic} alt={member.name} className="member-image" />
                ) : (
                  <div className="member-image-placeholder">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-email">{member.email}</p>
                <span className={`member-role-badge ${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && !error && (
          <div className="members-empty">
            <p>No members found in your department</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Members;
