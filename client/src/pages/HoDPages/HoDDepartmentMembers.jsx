import { useState } from 'react';
import HoDLayout from '../../components/HoDLayout';
import RoleToggle from '../../components/RoleToggle';
import Status from '../../components/Status';
import '../../styles/HoDDepartmentMembers.css';

const HoDDepartmentMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  // Dummy data
  const dummyMembers = [
    { 
      _id: '1', 
      name: 'Dr. Md. Hasanul Kabir', 
      email: 'hasanul@iut-dhaka.edu', 
      designation: 'Professor',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 5 }, casual: { total: 10, used: 2 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '2', 
      name: 'Dr. Muhammad Mahbub Alam', 
      email: 'mma@iut-dhaka.edu', 
      designation: 'Associate Professor',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 8 }, casual: { total: 10, used: 3 } },
      currentStatus: 'On Leave',
      returnDate: '2026-01-20'
    },
    { 
      _id: '3', 
      name: 'Abu Raihan Mostofa Kamal', 
      email: 'raihan.kamal@iut-dhaka.edu', 
      designation: 'Assistant Professor',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 3 }, casual: { total: 10, used: 1 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '4', 
      name: 'Dr. Kamrul Hasan', 
      email: 'hasank@iut-dhaka.edu', 
      designation: 'Professor',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 12 }, casual: { total: 10, used: 5 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '5', 
      name: 'Tareque Mohmud Chowdhury', 
      email: 'tareque@iut-dhaka.edu', 
      designation: 'Lecturer',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 6 }, casual: { total: 10, used: 2 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '6', 
      name: 'Shohel Ahmed', 
      email: 'a.shohel@iut-dhaka.edu', 
      designation: 'Lecturer',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 4 }, casual: { total: 10, used: 1 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '7', 
      name: 'Dr. Md Moniruzzaman', 
      email: 'milton@iut-dhaka.edu', 
      designation: 'Associate Professor',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 7 }, casual: { total: 10, used: 3 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '8', 
      name: 'Lutfun Nahar Lota', 
      email: 'lota@iut-dhaka.edu', 
      designation: 'Lecturer',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 9 }, casual: { total: 10, used: 4 } },
      currentStatus: 'On Duty',
      returnDate: null
    },
    { 
      _id: '9', 
      name: 'Ashraful Alam Khan', 
      email: 'ashraful@iut-dhaka.edu', 
      designation: 'Assistant Professor',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 2 }, casual: { total: 10, used: 0 } },
      currentStatus: 'On Leave',
      returnDate: '2026-01-19'
    },
    { 
      _id: '10', 
      name: 'Faisal Hussain', 
      email: 'faisalhussain@iut-dhaka.edu', 
      designation: 'Lecturer',
      profilePic: null,
      leaveBalance: { annual: { total: 20, used: 5 }, casual: { total: 10, used: 2 } },
      currentStatus: 'On Duty',
      returnDate: null
    }
  ];

  const filteredMembers = dummyMembers.filter(member =>
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
              <span className="stat-count">{dummyMembers.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">On Leave:</span>
              <span className="stat-count">{dummyMembers.filter(m => m.currentStatus === 'On Leave').length}</span>
            </div>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
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
                className={`member-card ${selectedMember?._id === member._id ? 'expanded' : ''}`}
                onClick={() => handleViewDetails(member)}
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
                    <Status 
                      currentStatus={member.currentStatus || 'OnDuty'} 
                      returnDate={member.returnDate}
                    />
                  </div>
                  <div className="expand-icon">
                    {selectedMember?._id === member._id ? '▲' : '▼'}
                  </div>
                </div>

                {selectedMember?._id === member._id && (
                  <div className="member-expanded-view">
                    <div className="expanded-section">
                      <div className="info-row">
                        <span className="info-label">📧 Email</span>
                        <span className="info-value">{member.email}</span>
                      </div>
                    </div>

                    <div className="expanded-section">
                      <h4 className="section-title">📊 Leave Balance</h4>
                      
                      <div className="leave-item">
                        <div className="leave-header">
                          <span className="leave-type">Annual Leave</span>
                          <span className="leave-count">
                            {member.leaveBalance.annual.used} / {member.leaveBalance.annual.total}
                          </span>
                        </div>
                        <div className="leave-bar">
                          <div 
                            className="leave-bar-fill annual"
                            style={{ width: `${calculateLeavePercentage(member.leaveBalance.annual.used, member.leaveBalance.annual.total)}%` }}
                          ></div>
                        </div>
                        <span className="leave-remaining">
                          {member.leaveBalance.annual.total - member.leaveBalance.annual.used} days remaining
                        </span>
                      </div>

                      <div className="leave-item">
                        <div className="leave-header">
                          <span className="leave-type">Casual Leave</span>
                          <span className="leave-count">
                            {member.leaveBalance.casual.used} / {member.leaveBalance.casual.total}
                          </span>
                        </div>
                        <div className="leave-bar">
                          <div 
                            className="leave-bar-fill casual"
                            style={{ width: `${calculateLeavePercentage(member.leaveBalance.casual.used, member.leaveBalance.casual.total)}%` }}
                          ></div>
                        </div>
                        <span className="leave-remaining">
                          {member.leaveBalance.casual.total - member.leaveBalance.casual.used} days remaining
                        </span>
                      </div>
                    </div>

                    <div className="expanded-section">
                      <h4 className="section-title">📈 Statistics</h4>
                      <div className="stats-compact">
                        <div className="stat-box">
                          <div className="stat-number">
                            {member.leaveBalance.annual.used + member.leaveBalance.casual.used}
                          </div>
                          <div className="stat-text">Total Used</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-number">
                            {(member.leaveBalance.annual.total - member.leaveBalance.annual.used) + 
                             (member.leaveBalance.casual.total - member.leaveBalance.casual.used)}
                          </div>
                          <div className="stat-text">Remaining</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-number">
                            {calculateLeavePercentage(
                              member.leaveBalance.annual.used + member.leaveBalance.casual.used,
                              member.leaveBalance.annual.total + member.leaveBalance.casual.total
                            )}%
                          </div>
                          <div className="stat-text">Utilized</div>
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
