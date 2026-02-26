import { useState, useEffect, useMemo } from 'react';
import { userAPI } from '../services/api';
import { MdSearch } from 'react-icons/md';
import '../styles/HoDSettings.css';

const HoDSettings = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('All');

  const departmentConfig = [
    { code: 'CSE', name: 'Computer Science & Engineering', color: '#2196F3', textColor: '#fff' },
    { code: 'EEE', name: 'Electrical & Electronic Engineering', color: '#FFD700', textColor: '#000' },
    { code: 'CEE', name: 'Civil & Environmental Engineering', color: '#4CAF50', textColor: '#fff' },
    { code: 'MPE', name: 'Mechanical & Production Engineering', color: '#f44336', textColor: '#fff' },
    { code: 'BTM', name: 'Business & Technology Management', color: '#9C27B0', textColor: '#fff' },
    { code: 'TVE', name: 'Technical & Vocational Education', color: '#FF9800', textColor: '#fff' }
  ];

  const designations = ['All', 'Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/departments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleDepartmentClick = async (deptConfig) => {
    // Toggle: if same department is clicked again, close the panel
    if (selectedDepartment?.code === deptConfig.code) {
      setSelectedDepartment(null);
      setMembers([]);
      setError('');
      setSuccess('');
      setSearchQuery('');
      setSelectedDesignation('All');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Find department by exact code match in the name
      const department = departments.find(d => {
        const deptName = d.name.toUpperCase().trim();
        const configCode = deptConfig.code.toUpperCase().trim();
        
        // Match if department name starts with or equals the code
        return deptName === configCode || 
               deptName.startsWith(configCode + ' ') ||
               deptName.startsWith(configCode + '-');
      });

      if (!department) {
        setError(`Department ${deptConfig.name} not found in database`);
        setMembers([]);
        setSelectedDepartment(null);
        return;
      }

      setSelectedDepartment({ ...deptConfig, id: department._id });

      const response = await userAPI.getMembersByDepartment(department._id);
      
      // Filter out HR users
      const filteredMembers = (response.data.members || []).filter(
        member => !member.roles?.includes('HR')
      );
      
      setMembers(filteredMembers);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError('Failed to load department members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHoD = async (userId, currentRoles) => {
    try {
      setProcessingUserId(userId);
      setError('');
      setSuccess('');
      
      const roles = currentRoles && Array.isArray(currentRoles) ? currentRoles : ['Employee'];
      const action = roles.includes('HoD') ? 'remove' : 'add';
      
      const response = await userAPI.updateUserRole(userId, action);

      // Update local state
      setMembers(members.map(member => 
        member._id === userId 
          ? { ...member, roles: response.data.user.roles }
          : member
      ));

      setSuccess(response.data.message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setProcessingUserId(null);
    }
  };

  const isHoD = (roles) => roles && roles.includes('HoD');

  // Filter members based on search and designation
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by designation
    if (selectedDesignation !== 'All') {
      filtered = filtered.filter(member =>
        member.designation === selectedDesignation
      );
    }

    return filtered;
  }, [members, searchQuery, selectedDesignation]);

  return (
    <div className="hod-settings">
      <div className="hod-settings-header">
        <h2>Head of Department Management</h2>
        <p className="hod-settings-subtitle">Select a department to assign its head</p>
      </div>

      {error && (
        <div className="hod-settings-alert error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="hod-settings-alert success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      <div className="department-buttons">
        {departmentConfig.map(dept => (
          <button
            key={dept.code}
            className={`dept-button ${selectedDepartment?.code === dept.code ? 'active' : ''}`}
            style={{
              backgroundColor: dept.color,
              color: dept.textColor,
              borderColor: selectedDepartment?.code === dept.code ? '#333' : dept.color
            }}
            onClick={() => handleDepartmentClick(dept)}
          >
            {dept.code}
          </button>
        ))}
      </div>

      {selectedDepartment && (
        <div className="department-section">
          <h3 className="department-title" style={{ color: selectedDepartment.color }}>
            {selectedDepartment.name}
          </h3>

          {loading ? (
            <div className="loading-state">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="empty-state">No members found in this department</div>
          ) : (
            <>
              {/* Search and Filter Section */}
              <div className="filter-section">
                <div className="search-box">
                  <MdSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by employee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="designation-filters">
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

              {/* Members List */}
              {filteredMembers.length === 0 ? (
                <div className="empty-state">No members match your search criteria</div>
              ) : (
                <div className="members-list">
                  {filteredMembers.map(member => (
                    <div key={member._id} className="member-list-item">
                    <div className="member-avatar-small">
                      {member.profilePic ? (
                        <img src={member.profilePic} alt={member.name} />
                      ) : (
                        <div className="avatar-placeholder-small">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="member-details">
                      <div className="member-main-info">
                        <h4 className="member-name-list">{member.name}</h4>
                        {isHoD(member.roles) && (
                          <span className="hod-badge-small">HoD</span>
                        )}
                      </div>
                      <p className="member-designation-list">{member.designation}</p>
                      <p className="member-email-list">{member.email}</p>
                    </div>
                    <button
                      className={`assign-btn-list ${isHoD(member.roles) ? 'remove' : 'assign'}`}
                      onClick={() => handleAssignHoD(member._id, member.roles)}
                      disabled={processingUserId === member._id}
                    >
                      {processingUserId === member._id
                        ? 'Processing...'
                        : isHoD(member.roles)
                        ? 'Remove HoD'
                        : 'Assign as HoD'}
                    </button>
                  </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HoDSettings;
