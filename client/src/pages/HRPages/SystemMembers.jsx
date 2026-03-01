import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HRLayout from '../../components/HRLayout';
import Status from '../../components/Status';
import LeaveDetailsModal from '../../components/LeaveDetailsModal';
import { userAPI } from '../../services/api';
import '../../styles/SystemMembers.css';

const SystemMembers = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [selectedLeaveStatus, setSelectedLeaveStatus] = useState('All');

  const designations = ['All', 'Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'];
  const leaveStatuses = ['All', 'Active', 'On Leave'];

  const departmentConfig = [
    { code: 'CSE', name: 'Computer Science & Engineering', color: '#2196F3', textColor: '#fff' },
    { code: 'EEE', name: 'Electrical & Electronic Engineering', color: '#FFD700', textColor: '#000' },
    { code: 'CEE', name: 'Civil & Environmental Engineering', color: '#4CAF50', textColor: '#fff' },
    { code: 'MPE', name: 'Mechanical & Production Engineering', color: '#f44336', textColor: '#fff' },
    { code: 'BTM', name: 'Business & Technology Management', color: '#9C27B0', textColor: '#fff' },
    { code: 'TVE', name: 'Technical & Vocational Education', color: '#FF9800', textColor: '#fff' }
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.statusFilter) {
      setSelectedLeaveStatus(location.state.statusFilter);
    }
  }, [location.state]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllMembersGrouped();
      const depts = response.data.departments || [];
      setDepartments(depts);

      // Initially no department is selected
      setSelectedDepartment(null);

      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load system members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (deptConfig) => {
    // Find the matching department from the fetched data
    const matchedDept = departments.find(d => 
      d.departmentName.toUpperCase().includes(deptConfig.code.toUpperCase())
    );

    if (!matchedDept) return;

    // Toggle: if same department is clicked again, close it
    if (selectedDepartment?.departmentId === matchedDept.departmentId) {
      setSelectedDepartment(null);
      setSearchTerm('');
      setSelectedDesignation('All');
      setSelectedLeaveStatus('All');
    } else {
      setSelectedDepartment({ ...matchedDept, config: deptConfig });
      setSearchTerm('');
      setSelectedDesignation('All');
      setSelectedLeaveStatus('All');
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  // Helper to sort members: HoD first
  const sortMembers = (members) => {
    return [...members].sort((a, b) => {
      const aIsHoD = a.roles?.includes('HoD');
      const bIsHoD = b.roles?.includes('HoD');
      if (aIsHoD && !bIsHoD) return -1;
      if (!aIsHoD && bIsHoD) return 1;
      return 0;
    });
  };

  // Filter and sort logic
  const getFilteredMembers = () => {
    if (!selectedDepartment) return [];

    const sortedMembers = sortMembers(selectedDepartment.members);

    let filtered = sortedMembers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by designation
    if (selectedDesignation !== 'All') {
      filtered = filtered.filter(member =>
        member.designation === selectedDesignation
      );
    }

    // Filter by leave status
    if (selectedLeaveStatus !== 'All') {
      if (selectedLeaveStatus === 'Active') {
        filtered = filtered.filter(member => member.currentStatus !== 'OnLeave');
      } else if (selectedLeaveStatus === 'On Leave') {
        filtered = filtered.filter(member => member.currentStatus === 'OnLeave');
      }
    }

    return filtered;
  };

  const filteredMembers = getFilteredMembers();

  // Stats calculation for selected department
  const deptTotalMembers = selectedDepartment ? selectedDepartment.members.length : 0;
  const deptOnLeaveCount = selectedDepartment 
    ? selectedDepartment.members.filter(m => m.currentStatus === 'OnLeave').length 
    : 0;
  const deptActiveCount = deptTotalMembers - deptOnLeaveCount;

  return (
    <HRLayout>
      <div className="system-members-container">
        <div className="page-header">
          <h1>System Members</h1>
          <p className="page-subtitle">Manage all employees grouped by department</p>
        </div>

        <div className="members-content">
          <div className="department-buttons">
            {departmentConfig.map(dept => {
              return (
                <button
                  key={dept.code}
                  className={`dept-button ${selectedDepartment?.config?.code === dept.code ? 'active' : ''}`}
                  style={{
                    backgroundColor: dept.color,
                    color: dept.textColor,
                    borderColor: selectedDepartment?.config?.code === dept.code ? '#333' : dept.color
                  }}
                  onClick={() => toggleDepartment(dept)}
                >
                  <span className="dept-code">{dept.code}</span>
                </button>
              );
            })}
          </div>

          {selectedDepartment && (
            <>
              <div className="members-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="filter-container">
                  <div className="filter-group">
                    <label className="filter-label">Designation:</label>
                    <div className="filter-buttons">
                      {designations.map(designation => (
                        <button
                          key={designation}
                          className={`filter-btn ${selectedDesignation === designation ? 'active' : ''}`}
                          onClick={() => setSelectedDesignation(designation)}
                        >
                          {designation}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Leave Status:</label>
                    <div className="filter-buttons">
                      {leaveStatuses.map(status => (
                        <button
                          key={status}
                          className={`filter-btn ${selectedLeaveStatus === status ? 'active' : ''}`}
                          onClick={() => setSelectedLeaveStatus(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="members-stats">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>{deptTotalMembers}</h3>
                    <p>Total Members</p>
                  </div>
                </div>
                <div className="stat-card stat-card-active">
                  <div className="stat-info">
                    <h3>{deptActiveCount}</h3>
                    <p>Active</p>
                  </div>
                </div>
                <div className="stat-card stat-card-leave">
                  <div className="stat-info">
                    <h3>{deptOnLeaveCount}</h3>
                    <p>On Leave</p>
                  </div>
                </div>
              </div>

            <div className="selected-department-section">
              <h3 className="department-title" style={{ color: selectedDepartment.config.color }}>
                {selectedDepartment.config.name}
              </h3>

              <div className="members-list-container">
                {loading ? (
                  <div className="loading-state">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="empty-state">
                    <p>No Members Found</p>
                  </div>
                ) : (
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
                        {filteredMembers.map(member => (
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
                                          <span>{member.name.charAt(0)}</span>
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
                                          returnDate={member.returnDate}
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
                        )}
                      </div>
                    </div>
                  </>
                )}
        </div>
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
    </HRLayout>
  );
};

export default SystemMembers;
