import { useState, useEffect } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import Status from '../../components/Status';
import LeaveDetailsModal from '../../components/LeaveDetailsModal';
import { userAPI } from '../../services/api';
import '../../styles/HoDDepartmentMembers.css';

const HoDDepartmentMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getDepartmentMembers();
      // Filter out HR users (users with HR role or role field === 'HR')
      const departmentMembers = (response.data.members || []).filter(
        member => {
          // Check if user has HR in roles array
          if (member.roles && member.roles.includes('HR')) {
            return false;
          }
          // Check if user has HR as singular role
          if (member.role === 'HR') {
            return false;
          }
          return true;
        }
      );
      setMembers(departmentMembers);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load department members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberClick = (member) => {
    // Only open modal if member is on leave
    if (member.currentStatus === 'OnLeave') {
      setSelectedMember(member);
    }
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <HoDLayout>
      <div className="hod-members-container">
        <div className="page-header">
          <h1>Department Members</h1>
          <p className="page-subtitle">View your department team</p>
        </div>

        <RoleToggle />

        <div className="members-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="members-stats">
            <div className="stat-badge">
              <span className="stat-label">Total Current Members:</span>
              <span className="stat-count">{members.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">On Leave:</span>
              <span className="stat-count">{members.filter(m => m.currentStatus === 'OnLeave').length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading members...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No members found</h3>
            <p>No department members match your search criteria.</p>
          </div>
        ) : (
          <div className="members-grid">
            {filteredMembers.map(member => (
              <div
                key={member._id}
                className={`member-card ${member.currentStatus === 'OnLeave' ? 'on-leave clickable' : ''}`}
                onClick={() => handleMemberClick(member)}
              >
                <div className="member-compact-view">
                  <div className="member-avatar">
                    {member.profilePic ? (
                      <img src={member.profilePic} alt={member.name} />
                    ) : (
                      <span className="avatar-initial">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="member-info-compact">
                    <h3>{member.name}</h3>
                    <p className="member-designation">{member.designation}</p>
                    <div className="member-status-row">
                      <Status
                        currentStatus={member.currentStatus === 'OnLeave' ? 'On Leave' : 'On Duty'}
                        returnDate={member.currentLeave?.endDate}
                      />
                    </div>
                  </div>
                  {member.currentStatus === 'OnLeave' && (
                    <div className="view-details-hint">
                      <span>View Details</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Details Modal */}
      {selectedMember && (
        <LeaveDetailsModal
          userId={selectedMember._id}
          memberName={selectedMember.name}
          onClose={handleCloseModal}
        />
      )}
    </HoDLayout>
  );
};

export default HoDDepartmentMembers;
