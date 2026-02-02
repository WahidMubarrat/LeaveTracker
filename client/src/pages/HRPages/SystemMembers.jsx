import { useState, useEffect } from 'react';
import HRLayout from '../../components/HRLayout';
import { MdSearch, MdPeople, MdBusiness, MdCheckCircle, MdPause, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import Status from '../../components/Status';
import { userAPI } from '../../services/api';
import '../../styles/SystemMembers.css';

const SystemMembers = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDepts, setExpandedDepts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllMembersGrouped();
      const depts = response.data.departments || [];
      setDepartments(depts);

      // Initially expand all departments
      const initialExpanded = {};
      depts.forEach(d => {
        initialExpanded[d.departmentId] = true;
      });
      setExpandedDepts(initialExpanded);

      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load system members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  // Filter logic
  const filteredDepartments = departments.map(dept => {
    // If search term is empty, return dept as is
    if (!searchTerm) return dept;

    // Filter members based on search
    const filteredMembers = dept.members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If members match, return dept with filtered members
    // OR if department name matches, return all members
    if (dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return dept;
    }

    return {
      ...dept,
      members: filteredMembers
    };
  }).filter(dept => dept.members.length > 0 || dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Stats calculation
  const totalMembers = departments.reduce((acc, dept) => acc + dept.members.length, 0);
  const totalDepts = departments.length;
  const onLeaveCount = departments.reduce((acc, dept) =>
    acc + dept.members.filter(m => m.currentStatus === 'OnLeave').length, 0
  );

  return (
    <HRLayout>
      <div className="system-members-container">
        <div className="page-header">
          <h1>System Members</h1>
          <p className="page-subtitle">Manage all employees grouped by department</p>
        </div>

        <div className="members-content">
          <div className="members-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search members or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="members-stats">
            <div className="stat-card">
              <MdPeople className="stat-icon" />
              <div className="stat-info">
                <h3>{totalMembers}</h3>
                <p>Total Members</p>
              </div>
            </div>
            <div className="stat-card">
              <MdBusiness className="stat-icon" />
              <div className="stat-info">
                <h3>{totalDepts}</h3>
                <p>Departments</p>
              </div>
            </div>
            <div className="stat-card">
              <MdPause className="stat-icon" />
              <div className="stat-info">
                <h3>{onLeaveCount}</h3>
                <p>On Leave</p>
              </div>
            </div>
          </div>

          <div className="members-list-container">
            {loading ? (
              <div className="loading-state">Loading members...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : filteredDepartments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Members Found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              <div className="departments-list">
                {filteredDepartments.map(dept => (
                  <div key={dept.departmentId} className="department-group">
                    <div
                      className="department-header"
                      onClick={() => toggleDepartment(dept.departmentId)}
                    >
                      <div className="dept-info">
                        <h3>{dept.departmentName}</h3>
                        <span className="member-count-badge">{dept.members.length} members</span>
                      </div>
                      <div className="dept-toggle-icon">
                        {expandedDepts[dept.departmentId] ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                      </div>
                    </div>

                    {expandedDepts[dept.departmentId] && (
                      <div className="department-members-grid">
                        {dept.members.length === 0 ? (
                          <p className="no-members-msg">No members in this department</p>
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
                                {dept.members.map(member => (
                                  <tr key={member._id}>
                                    <td className="member-name-cell">
                                      <div className="member-avatar-small">
                                        {member.profilePic ? (
                                          <img src={member.profilePic} alt={member.name} />
                                        ) : (
                                          <span>{member.name.charAt(0)}</span>
                                        )}
                                      </div>
                                      <div className="member-details-text">
                                        <span className="name-text">{member.name}</span>
                                        <span className="email-text">{member.email}</span>
                                      </div>
                                    </td>
                                    <td>{member.designation}</td>
                                    <td>
                                      <Status
                                        currentStatus={member.currentStatus === 'OnLeave' ? 'On Leave' : 'On Duty'}
                                        returnDate={member.returnDate}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default SystemMembers;
