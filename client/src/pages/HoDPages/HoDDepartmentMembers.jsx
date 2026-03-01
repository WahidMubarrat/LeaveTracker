import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [statusFilter, setStatusFilter] = useState('all'); // all, onDuty, onLeave
  const [designationFilter, setDesignationFilter] = useState('all'); // all, Professor, etc.
  const [selectedMember, setSelectedMember] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (location.state?.statusFilter) {
      setStatusFilter(location.state.statusFilter);
    }
  }, [location.state]);

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

  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

  const filteredMembers = members.filter(member => {
    // Search filter
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all') {
      const isOnLeave = member.currentStatus === 'OnLeave';
      if (statusFilter === 'onLeave' && !isOnLeave) return false;
      if (statusFilter === 'onDuty' && isOnLeave) return false;
    }

    // Designation filter
    if (designationFilter !== 'all') {
      if (member.designation !== designationFilter) return false;
    }

    return true;
  });

  const handleMemberClick = (member) => {
    setSelectedMember(member);
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
          <div className="controls-top">
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
                <span className="stat-label">Total:</span>
                <span className="stat-count">{members.length}</span>
              </div>
              <div className="stat-badge">
                <span className="stat-label">On Leave:</span>
                <span className="stat-count">{members.filter(m => m.currentStatus === 'OnLeave').length}</span>
              </div>
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <div className="filter-options">
                <button
                  className={`filter-option ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-option ${statusFilter === 'onDuty' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('onDuty')}
                >
                  On Duty
                </button>
                <button
                  className={`filter-option ${statusFilter === 'onLeave' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('onLeave')}
                >
                  On Leave
                </button>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Designation:</span>
              <div className="filter-options">
                <button
                  className={`filter-option ${designationFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setDesignationFilter('all')}
                >
                  All
                </button>
                {designations.map(d => (
                  <button
                    key={d}
                    className={`filter-option ${designationFilter === d ? 'active' : ''}`}
                    onClick={() => setDesignationFilter(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading members...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>No members found</p>
          </div>
        ) : (
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
                  {filteredMembers
                    .sort((a, b) => {
                      const aIsHoD = a.roles?.includes('HoD');
                      const bIsHoD = b.roles?.includes('HoD');
                      if (aIsHoD && !bIsHoD) return -1;
                      if (!aIsHoD && bIsHoD) return 1;
                      return 0;
                    })
                    .map(member => (
                      <tr
                        key={member._id}
                        className={`clickable-row ${member.currentStatus === 'OnLeave' ? 'on-leave-row' : ''}`}
                        onClick={() => handleMemberClick(member)}
                      >
                        <td className="member-name-cell">
                          <div className="member-avatar-small">
                            {member.profilePic ? (
                              <img src={member.profilePic} alt={member.name} />
                            ) : (
                              <span>{member.name.charAt(0).toUpperCase()}</span>
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
                        <td>{member.designation}</td>
                        <td>
                          <div className="status-with-hint">
                            <Status
                              currentStatus={member.currentStatus === 'OnLeave' ? 'On Leave' : 'On Duty'}
                              returnDate={member.currentLeave?.endDate}
                            />
                            {member.currentStatus === 'OnLeave' && (
                              <span className="click-hint">Click for details</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Leave Details Modal */}
      {selectedMember && (
        <LeaveDetailsModal
          userId={selectedMember._id}
          memberName={selectedMember.name}
          initialOnLeave={selectedMember.currentStatus === 'OnLeave'}
          onClose={handleCloseModal}
        />
      )}
    </HoDLayout>
  );
};

export default HoDDepartmentMembers;
