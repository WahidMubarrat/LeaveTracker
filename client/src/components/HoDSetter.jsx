import { useState, useEffect } from 'react';
import '../styles/HoDSetter.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HoDSetter = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔄 Fetching data for HoD setter...');
      
      // Fetch all users and departments
      const [usersResponse, departmentsResponse] = await Promise.all([
        fetch(`${API_URL}/users/all-users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/departments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      console.log('Users response status:', usersResponse.status);
      console.log('Departments response status:', departmentsResponse.status);

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        console.error('Users fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      if (!departmentsResponse.ok) {
        const errorData = await departmentsResponse.json();
        console.error('Departments fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch departments');
      }

      const usersData = await usersResponse.json();
      const departmentsData = await departmentsResponse.json();

      console.log('Fetched users:', usersData.users?.length || 0);
      console.log('Fetched departments:', departmentsData.departments?.length || departmentsData.length || 0);

      setUsers(usersData.users || []);
      setDepartments(departmentsData.departments || departmentsData || []);
      setError('');
    } catch (err) {
      console.error('❌ Fetch data error:', err);
      setError(err.message || 'Failed to load data');
      setUsers([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHoD = async (userId, currentRoles) => {
    try {
      setProcessingUserId(userId);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      // Ensure currentRoles is an array, default to ['Employee'] if not
      const roles = currentRoles && Array.isArray(currentRoles) ? currentRoles : ['Employee'];
      const action = roles.includes('HoD') ? 'remove' : 'add';
      
      console.log('🔄 Sending HoD assignment request...');
      console.log('User ID:', userId);
      console.log('Action:', action);
      console.log('Current roles:', roles);
      
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update role');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, roles: data.user.roles }
          : user
      ));

      setSuccess(data.message);
      console.log('✅ Success:', data.message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to update role');
    } finally {
      setProcessingUserId(null);
    }
  };

  const getUsersByDepartment = (departmentId) => {
    const filtered = users.filter(user => {
      // Must be in this department
      if (user.department?._id !== departmentId) return false;
      
      // If no roles array, include them (they're Employee by default)
      if (!user.roles || user.roles.length === 0) return true;
      
      // Exclude HR users
      if (user.roles.includes('HR')) return false;
      
      return true;
    });
    
    console.log(`Department ${departmentId}: Found ${filtered.length} users`);
    return filtered;
  };

  const isHoD = (roles) => roles && roles.includes('HoD');

  if (loading) {
    return <div className="hod-setter-loading">Loading...</div>;
  }

  return (
    <div className="hod-setter">
      <div className="hod-setter-header">
        <h2>Head of Department Assignment</h2>
        <p className="hod-setter-subtitle">Assign department heads for each department</p>
      </div>

      {error && (
        <div className="hod-setter-error">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {success && (
        <div className="hod-setter-success">
          {success}
          <button onClick={() => setSuccess('')} className="success-close">×</button>
        </div>
      )}

      <div className="departments-grid">
        {departments.map(department => {
          const departmentUsers = getUsersByDepartment(department._id);
          const currentHoD = departmentUsers.find(user => isHoD(user.roles));

          return (
            <div key={department._id} className="department-card">
              <div className="department-header">
                <h3>{department.name}</h3>
                <span className="member-count">{departmentUsers.length} members</span>
              </div>

              {currentHoD && (
                <div className="current-hod">
                  <div className="hod-badge">Current HoD</div>
                  <div className="hod-info">
                    <div className="hod-avatar">
                      {currentHoD.profilePic ? (
                        <img src={currentHoD.profilePic} alt={currentHoD.name} />
                      ) : (
                        <span>{currentHoD.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="hod-name">{currentHoD.name}</div>
                      <div className="hod-email">{currentHoD.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignHoD(currentHoD._id, currentHoD.roles)}
                    disabled={processingUserId === currentHoD._id}
                    className="remove-hod-btn"
                  >
                    {processingUserId === currentHoD._id ? 'Removing...' : '✖ Remove'}
                  </button>
                </div>
              )}

              <div className="members-list">
                <div className="members-list-header">
                  {currentHoD ? 'Other Members:' : 'Select a Head of Department:'}
                </div>
                {departmentUsers
                  .filter(user => !isHoD(user.roles))
                  .map(user => (
                    <div key={user._id} className="member-item">
                      <div className="member-info">
                        <div className="member-avatar">
                          {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name} />
                          ) : (
                            <span>{user.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="member-name">{user.name}</div>
                          <div className="member-designation">{user.designation}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignHoD(user._id, user.roles)}
                        disabled={processingUserId === user._id}
                        className="assign-hod-btn"
                      >
                        {processingUserId === user._id ? 'Assigning...' : '✓ Make HoD'}
                      </button>
                    </div>
                  ))}
                
                {departmentUsers.filter(user => !isHoD(user.roles)).length === 0 && !currentHoD && (
                  <div className="no-members">No members available</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {departments.length === 0 && (
        <div className="no-departments">
          <p>No departments found in the system</p>
        </div>
      )}
    </div>
  );
};

export default HoDSetter;
