import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import '../styles/HoDSettings.css';

const HoDSettings = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  const departmentConfig = [
    { code: 'CSE', name: 'Computer Science & Engineering', color: '#2196F3', textColor: '#fff' },
    { code: 'EEE', name: 'Electrical & Electronic Engineering', color: '#FFD700', textColor: '#000' },
    { code: 'CIVIL', name: 'Civil Engineering', color: '#4CAF50', textColor: '#fff' },
    { code: 'MECH', name: 'Mechanical Engineering', color: '#f44336', textColor: '#fff' },
    { code: 'BTM', name: 'Business & Technology Management', color: '#9C27B0', textColor: '#fff' },
    { code: 'TVE', name: 'Technical & Vocational Education', color: '#FF9800', textColor: '#fff' }
  ];

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
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Find department by matching name (partial match)
      const department = departments.find(d => 
        d.name.toUpperCase().includes(deptConfig.code) || 
        deptConfig.name.toLowerCase().includes(d.name.toLowerCase())
      );

      if (!department) {
        setError(`Department ${deptConfig.name} not found`);
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
            <div className="members-grid">
              {members.map(member => (
                <div key={member._id} className="member-card">
                  <div className="member-avatar">
                    {member.profilePic ? (
                      <img src={member.profilePic} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">{member.name}</h4>
                    <p className="member-designation">{member.designation}</p>
                    <p className="member-email">{member.email}</p>
                    {isHoD(member.roles) && (
                      <span className="hod-badge">Head of Department</span>
                    )}
                  </div>
                  <button
                    className={`assign-btn ${isHoD(member.roles) ? 'remove' : 'assign'}`}
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
        </div>
      )}
    </div>
  );
};

export default HoDSettings;
