import { useState } from 'react';
import HRLayout from '../../components/HRLayout';
import '../../styles/SystemMembers.css';

const SystemMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Dummy data
  const dummyMembers = [
    { id: 1, name: 'Dr. Md. Hasanul Kabir', email: 'hasanul@iut-dhaka.edu', department: 'CSE', designation: 'Professor', status: 'Active', roles: ['Employee', 'HoD'] },
    { id: 2, name: 'Dr. Muhammad Mahbub Alam', email: 'mma@iut-dhaka.edu', department: 'CSE', designation: 'Associate Professor', status: 'Active', roles: ['Employee'] },
    { id: 3, name: 'Abu Raihan Mostofa Kamal', email: 'raihan.kamal@iut-dhaka.edu', department: 'CSE', designation: 'Assistant Professor', status: 'Active', roles: ['Employee'] },
    { id: 4, name: 'Dr. Kamrul Hasan', email: 'hasank@iut-dhaka.edu', department: 'CSE', designation: 'Professor', status: 'Active', roles: ['Employee'] },
    { id: 5, name: 'Tareque Mohmud Chowdhury', email: 'tareque@iut-dhaka.edu', department: 'CSE', designation: 'Lecturer', status: 'Active', roles: ['Employee'] },
    { id: 6, name: 'Dr. Azhar Mahmud', email: 'azhar@iut-dhaka.edu', department: 'EEE', designation: 'Professor', status: 'Active', roles: ['Employee', 'HoD'] },
    { id: 7, name: 'Rashid Ahmed', email: 'rashid@iut-dhaka.edu', department: 'EEE', designation: 'Assistant Professor', status: 'Active', roles: ['Employee'] },
    { id: 8, name: 'Dr. Sanjida Rahman', email: 'sanjida@iut-dhaka.edu', department: 'Civil', designation: 'Associate Professor', status: 'Active', roles: ['Employee'] },
    { id: 9, name: 'Kamal Hossain', email: 'kamal@iut-dhaka.edu', department: 'Mechanical', designation: 'Lecturer', status: 'On Leave', roles: ['Employee'] },
    { id: 10, name: 'Fatima Khan', email: 'fatima@iut-dhaka.edu', department: 'BTM', designation: 'Assistant Professor', status: 'Active', roles: ['Employee'] },
  ];

  const filteredMembers = dummyMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || member.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <HRLayout>
      <div className="system-members-container">
        <div className="page-header">
          <h1>System Members</h1>
          <p className="page-subtitle">Manage all employees and departments</p>
        </div>

        <div className="members-content">
          <div className="members-actions">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="dept-filter"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="EEE">EEE</option>
              <option value="Civil">Civil</option>
              <option value="Mechanical">Mechanical</option>
              <option value="BTM">BTM</option>
              <option value="TVE">TVE</option>
            </select>
          </div>

          <div className="members-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{dummyMembers.length}</h3>
                <p>Total Members</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-info">
                <h3>6</h3>
                <p>Departments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{dummyMembers.filter(m => m.status === 'Active').length}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏸️</div>
              <div className="stat-info">
                <h3>{dummyMembers.filter(m => m.status === 'On Leave').length}</h3>
                <p>On Leave</p>
              </div>
            </div>
          </div>

          <div className="members-table-container">
            {filteredMembers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Members Found</h3>
                <p>Try adjusting your search or filter</p>
              </div>
            ) : (
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Roles</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td className="member-name-cell">
                        <div className="member-avatar-small">
                          {member.name.charAt(0)}
                        </div>
                        <span>{member.name}</span>
                      </td>
                      <td>{member.email}</td>
                      <td>
                        <span className={`dept-badge dept-${member.department.toLowerCase()}`}>
                          {member.department}
                        </span>
                      </td>
                      <td>{member.designation}</td>
                      <td>
                        <div className="roles-badges">
                          {member.roles.map((role, idx) => (
                            <span key={idx} className={`role-badge role-${role.toLowerCase()}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${member.status.toLowerCase().replace(' ', '-')}`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default SystemMembers;
