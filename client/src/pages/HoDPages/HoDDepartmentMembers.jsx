import { useState, useEffect } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import '../../styles/HoDDepartmentMembers.css';

const HoDDepartmentMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchDepartmentMembers();
  }, []);

  const fetchDepartmentMembers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const token = localStorage.getItem('token');
      // const response = await fetch('http://localhost:5000/api/hod/department-members', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setMembers(data.members);

      // Mock data for now
      setMembers([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          designation: 'Lecturer',
          leaveQuota: { annual: 30, sick: 10 },
          usedLeave: { annual: 5, sick: 2 },
          profilePic: null
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          designation: 'Assistant Professor',
          leaveQuota: { annual: 30, sick: 10 },
          usedLeave: { annual: 8, sick: 1 },
          profilePic: null
        },
        {
          _id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          designation: 'Associate Professor',
          leaveQuota: { annual: 30, sick: 10 },
          usedLeave: { annual: 12, sick: 3 },
          profilePic: null
        },
        {
          _id: '4',
          name: 'Sarah Williams',
          email: 'sarah@example.com',
          designation: 'Professor',
          leaveQuota: { annual: 30, sick: 10 },
          usedLeave: { annual: 3, sick: 0 },
          profilePic: null
        }
      ]);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateLeavePercentage = (used, total) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const handleViewDetails = (member) => {
    setSelectedMember(selectedMember?._id === member._id ? null : member);
  };

  return (
    <HoDLayout>
      <div className="hod-members-container">
        <div className="page-header">
          <h1>Department Members</h1>
          <p className="page-subtitle">View and manage your department team</p>
        </div>

        <RoleToggle />

        <div className="members-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search members by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="members-stats">
            <div className="stat-badge">
              <span className="stat-label">Total Members:</span>
              <span className="stat-count">{members.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No members found</h3>
            <p>No department members match your search criteria.</p>
          </div>
        ) : (
          <div className="members-grid">
            {filteredMembers.map(member => (
              <div key={member._id} className="member-card">
                <div className="member-header">
                  <div className="member-avatar">
                    {member.profilePic ? (
                      <img src={member.profilePic} alt={member.name} />
                    ) : (
                      <span className="avatar-initial">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="member-basic-info">
                    <h3>{member.name}</h3>
                    <p className="member-designation">{member.designation}</p>
                    <p className="member-email">{member.email}</p>
                  </div>
                </div>

                <div className="member-leave-summary">
                  <div className="leave-stat">
                    <div className="leave-stat-header">
                      <span className="leave-type">Annual Leave</span>
                      <span className="leave-numbers">
                        {member.usedLeave.annual} / {member.leaveQuota.annual}
                      </span>
                    </div>
                    <div className="leave-progress-bar">
                      <div 
                        className="leave-progress-fill annual"
                        style={{ width: `${calculateLeavePercentage(member.usedLeave.annual, member.leaveQuota.annual)}%` }}
                      ></div>
                    </div>
                    <span className="leave-remaining">
                      {member.leaveQuota.annual - member.usedLeave.annual} remaining
                    </span>
                  </div>

                  <div className="leave-stat">
                    <div className="leave-stat-header">
                      <span className="leave-type">Sick Leave</span>
                      <span className="leave-numbers">
                        {member.usedLeave.sick} / {member.leaveQuota.sick}
                      </span>
                    </div>
                    <div className="leave-progress-bar">
                      <div 
                        className="leave-progress-fill sick"
                        style={{ width: `${calculateLeavePercentage(member.usedLeave.sick, member.leaveQuota.sick)}%` }}
                      ></div>
                    </div>
                    <span className="leave-remaining">
                      {member.leaveQuota.sick - member.usedLeave.sick} remaining
                    </span>
                  </div>
                </div>

                <button
                  className="view-details-btn"
                  onClick={() => handleViewDetails(member)}
                >
                  {selectedMember?._id === member._id ? 'Hide Details' : 'View Details'}
                </button>

                {selectedMember?._id === member._id && (
                  <div className="member-details-expanded">
                    <div className="detail-section">
                      <h4>Leave Statistics</h4>
                      <div className="stats-grid">
                        <div className="stat-item">
                          <span className="stat-label">Total Leave Used:</span>
                          <span className="stat-value">
                            {member.usedLeave.annual + member.usedLeave.sick} days
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total Remaining:</span>
                          <span className="stat-value">
                            {(member.leaveQuota.annual - member.usedLeave.annual) + 
                             (member.leaveQuota.sick - member.usedLeave.sick)} days
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Annual Utilization:</span>
                          <span className="stat-value">
                            {calculateLeavePercentage(member.usedLeave.annual, member.leaveQuota.annual)}%
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Sick Utilization:</span>
                          <span className="stat-value">
                            {calculateLeavePercentage(member.usedLeave.sick, member.leaveQuota.sick)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </HoDLayout>
  );
};

export default HoDDepartmentMembers;
