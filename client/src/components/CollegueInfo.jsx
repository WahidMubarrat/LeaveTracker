import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { userAPI } from '../services/api';
import Status from './Status';

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
        <div className="members-list-wrapper">
          <div className="members-table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members
                  .sort((a, b) => {
                    const aIsHoD = a.roles?.includes('HoD');
                    const bIsHoD = b.roles?.includes('HoD');
                    if (aIsHoD && !bIsHoD) return -1;
                    if (!aIsHoD && bIsHoD) return 1;
                    return 0;
                  })
                  .map((member) => (
                    <tr key={member._id} className={member.currentStatus === 'OnLeave' ? 'on-leave-row' : ''}>
                      <td className="member-name-cell">
                        <div className="member-avatar-small">
                          {member.profilePic ? (
                            <img src={member.profilePic} alt={member.name} />
                          ) : (
                            <span>{member.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="member-details-text">
                          <div className="name-box">
                            <span className="name-text">{member.name}</span>
                            {member.roles?.includes('HoD') && (
                              <span className="hod-indicator-badge">HoD</span>
                            )}
                          </div>
                          <span className="email-text">{member.email}</span>
                        </div>
                      </td>
                      <td>{member.designation || 'N/A'}</td>
                      <td>
                        <Status
                          currentStatus={member.currentStatus === 'OnLeave' ? 'On Leave' : 'On Duty'}
                          returnDate={member.currentLeave?.endDate}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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
