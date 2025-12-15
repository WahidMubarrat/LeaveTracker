import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { userAPI } from '../services/api';

const CollegueInfo = ({ onMembersLoaded }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await userAPI.getDepartmentMembers();
        const memberList = data?.members ?? [];

        if (!isActive) return;

        setMembers(memberList);
        onMembersLoaded?.(memberList);
      } catch (err) {
        if (!isActive) return;

        console.error('Failed to fetch department members:', err);
        const message = err.response?.data?.message || 'Failed to load members';
        setError(message);
        setMembers([]);
        onMembersLoaded?.([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isActive = false;
    };
  }, [onMembersLoaded]);

  if (loading) {
    return <div className="members-loading">Loading members...</div>;
  }

  return (
    <>
      {error && <div className="members-error">{error}</div>}

      {members.length > 0 ? (
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
                {member.designation && (
                  <p className="member-designation">{member.designation}</p>
                )}
                {member.role && (
                  <span className={`member-role-badge ${member.role.toLowerCase()}`}>
                    {member.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="members-empty">
            <p>No members found in your department</p>
          </div>
        )
      )}
    </>
  );
};

CollegueInfo.propTypes = {
  onMembersLoaded: PropTypes.func,
};

export default CollegueInfo;
