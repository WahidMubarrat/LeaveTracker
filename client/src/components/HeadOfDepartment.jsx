import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import '../styles/HeadOfDepartment.css';

const HeadOfDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assigningHoD, setAssigningHoD] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userAPI.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
      console.error('Fetch departments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setError('');
    setSuccess('');
  };

  const handleAssignHoD = async (userId, userName) => {
    if (!window.confirm(`Assign ${userName} as Head of ${selectedDepartment.name}?`)) {
      return;
    }

    try {
      setAssigningHoD(true);
      setError('');
      setSuccess('');

      await userAPI.assignHoD({
        userId: userId,
        departmentId: selectedDepartment._id
      });

      setSuccess(`${userName} has been assigned as Head of ${selectedDepartment.name}`);
      
      // Refresh departments data
      await fetchDepartments();
      
      // Update selected department
      const updatedDept = departments.find(d => d._id === selectedDepartment._id);
      if (updatedDept) {
        setSelectedDepartment(updatedDept);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign HoD');
      console.error('Assign HoD error:', err);
    } finally {
      setAssigningHoD(false);
    }
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="hod-container">
        <div className="hod-loading">Loading departments...</div>
      </div>
    );
  }

  return (
    <div className="hod-container">
      <div className="hod-header">
        <h2>Head of Department Management</h2>
        <p className="hod-subtitle">Assign department heads from employee list</p>
      </div>

      {error && <div className="hod-error">{error}</div>}
      {success && <div className="hod-success">{success}</div>}

      {!selectedDepartment ? (
        // Department List View
        <div className="departments-grid">
          {departments.length === 0 ? (
            <div className="empty-state">
              <p>No departments found</p>
            </div>
          ) : (
            departments.map((dept) => (
              <div 
                key={dept._id} 
                className="department-card"
                onClick={() => handleDepartmentClick(dept)}
              >
                <div className="dept-icon">🏢</div>
                <h3>{dept.name}</h3>
                <div className="dept-info">
                  <p className="member-count">
                    👥 {dept.employees?.length || 0} Members
                  </p>
                  {dept.headOfDepartment ? (
                    <p className="current-hod">
                      <span className="hod-badge">HoD:</span>
                      <span className="hod-name">{dept.headOfDepartment.name}</span>
                    </p>
                  ) : (
                    <p className="no-hod">No HoD assigned</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Members List View
        <div className="members-view">
          <div className="members-header">
            <button className="back-btn" onClick={handleBackToDepartments}>
              ← Back to Departments
            </button>
            <h3>{selectedDepartment.name}</h3>
            {selectedDepartment.headOfDepartment && (
              <p className="current-hod-info">
                Current HoD: <strong>{selectedDepartment.headOfDepartment.name}</strong>
              </p>
            )}
          </div>

          <div className="members-list">
            {selectedDepartment.employees && selectedDepartment.employees.length > 0 ? (
              selectedDepartment.employees.map((member) => {
                const isCurrentHoD = selectedDepartment.headOfDepartment?._id === member._id;
                const isHoD = member.roles?.includes('HoD');

                return (
                  <div key={member._id} className="member-card">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.profilePic ? (
                          <img src={member.profilePic} alt={member.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="member-details">
                        <h4>{member.name}</h4>
                        <p className="member-email">{member.email}</p>
                        <p className="member-designation">{member.designation}</p>
                        {isHoD && (
                          <span className="role-badge hod-role">Head of Department</span>
                        )}
                      </div>
                    </div>
                    <div className="member-actions">
                      {isCurrentHoD ? (
                        <span className="current-hod-label">Current HoD</span>
                      ) : (
                        <button
                          className="assign-btn"
                          onClick={() => handleAssignHoD(member._id, member.name)}
                          disabled={assigningHoD}
                        >
                          {assigningHoD ? 'Assigning...' : 'Assign as HoD'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No members in this department</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadOfDepartment;
