import { useState, useEffect, useMemo } from 'react';
import { userAPI } from '../services/api';
import { MdSearch, MdArrowBack, MdPeople } from 'react-icons/md';
import '../styles/HoDSettings.css';

const HoDSettings = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptSummaries, setDeptSummaries] = useState({});
  const [cardLoading, setCardLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [hodWarning, setHodWarning] = useState('');

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
    fetchInitialData();
  }, []);

  const buildSummaries = (groupedDepts) => {
    const summaries = {};
    departmentConfig.forEach(config => {
      const match = groupedDepts.find(d =>
        d.departmentName?.toUpperCase().includes(config.code.toUpperCase())
      );
      if (match) {
        const nonHR = (match.members || []).filter(m => !m.roles?.includes('HR'));
        const hod = nonHR.find(m => m.roles?.includes('HoD')) || null;
        summaries[config.code] = { hod, totalMembers: nonHR.length };
      } else {
        summaries[config.code] = { hod: null, totalMembers: 0 };
      }
    });
    return summaries;
  };

  const fetchInitialData = async () => {
    try {
      setCardLoading(true);
      const [deptRes, membersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/departments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        userAPI.getAllMembersGrouped(),
      ]);
      const deptData = await deptRes.json();
      setDepartments(deptData.departments || []);
      const grouped = membersRes.data?.departments || [];
      setDeptSummaries(buildSummaries(grouped));
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setCardLoading(false);
    }
  };

  const handleCardClick = async (deptConfig) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setSearchQuery('');
      setSelectedDesignation('All');

      const department = departments.find(d => {
        const deptName = d.name.toUpperCase().trim();
        const configCode = deptConfig.code.toUpperCase().trim();
        return deptName === configCode ||
               deptName.startsWith(configCode + ' ') ||
               deptName.startsWith(configCode + '-');
      });

      if (!department) {
        setError(`Department ${deptConfig.name} not found in database`);
        return;
      }

      setSelectedDepartment({ ...deptConfig, id: department._id });

      const response = await userAPI.getMembersByDepartment(department._id);
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

  const handleBack = () => {
    setSelectedDepartment(null);
    setMembers([]);
    setError('');
    setSuccess('');
    setSearchQuery('');
    setSelectedDesignation('All');
  };

  const handleAssignHoD = async (userId, currentRoles) => {
    const roles = currentRoles && Array.isArray(currentRoles) ? currentRoles : ['Employee'];
    const action = roles.includes('HoD') ? 'remove' : 'add';

    if (action === 'add') {
      const existingHoD = members.find(m => m._id !== userId && isHoD(m.roles));
      if (existingHoD) {
        setHodWarning(
          `This department already has a HoD (${existingHoD.name}). Please remove the existing HoD first before assigning a new one.`
        );
        return;
      }
    }

    try {
      setProcessingUserId(userId);
      setError('');
      setSuccess('');

      const response = await userAPI.updateUserRole(userId, action);

      const updatedMembers = members.map(member =>
        member._id === userId
          ? { ...member, roles: response.data.user.roles }
          : member
      );
      setMembers(updatedMembers);

      if (selectedDepartment) {
        const nonHR = updatedMembers.filter(m => !m.roles?.includes('HR'));
        const hod = nonHR.find(m => m.roles?.includes('HoD')) || null;
        setDeptSummaries(prev => ({
          ...prev,
          [selectedDepartment.code]: { ...prev[selectedDepartment.code], hod }
        }));
      }

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

  const filteredMembers = useMemo(() => {
    let filtered = members;
    if (searchQuery.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedDesignation !== 'All') {
      filtered = filtered.filter(member => member.designation === selectedDesignation);
    }
    return filtered.sort((a, b) => {
      const aIsHoD = isHoD(a.roles);
      const bIsHoD = isHoD(b.roles);
      if (aIsHoD && !bIsHoD) return -1;
      if (!aIsHoD && bIsHoD) return 1;
      return 0;
    });
  }, [members, searchQuery, selectedDesignation]);

  const renderCards = () => (
    <div className="hod-dept-grid">
      {cardLoading ? (
        <div className="loading-state" style={{ gridColumn: '1/-1' }}>Loading departments...</div>
      ) : (
        departmentConfig.map(dept => {
          const summary = deptSummaries[dept.code] || {};
          const hod = summary.hod;
          return (
            <div
              key={dept.code}
              className="hod-dept-card"
              onClick={() => handleCardClick(dept)}
            >
              <div className="hod-card-banner" style={{ backgroundColor: dept.color }}>
                <span className="hod-card-code" style={{ color: dept.textColor }}>{dept.code}</span>
              </div>
              <div className="hod-card-avatar-wrap">
                {hod?.profilePic ? (
                  <img src={hod.profilePic} alt={hod.name} className="hod-card-avatar" />
                ) : (
                  <div
                    className="hod-card-avatar hod-card-avatar-placeholder"
                    style={{ backgroundColor: dept.color, color: dept.textColor }}
                  >
                    {dept.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hod-card-body">
                <h3 className="hod-card-dept-name">{dept.name}</h3>
                <p className={`hod-card-hod-name ${!hod ? 'hod-card-hod-empty' : ''}`}>
                  {hod ? `HoD: ${hod.name}` : 'No HoD assigned'}
                </p>
                <div className="hod-card-stats">
                  <span className="hod-card-stat">
                    <MdPeople className="hod-card-stat-icon" />
                    {summary.totalMembers ?? '-'} members
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderDetail = () => (
    <div className="department-section">
      <div className="hod-detail-header">
        <button className="hod-back-btn" onClick={handleBack}>
          <MdArrowBack /> Back
        </button>
        <h3 className="department-title" style={{ color: selectedDepartment.color }}>
          {selectedDepartment.name}
        </h3>
      </div>

      {loading ? (
        <div className="loading-state">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="empty-state">No members found in this department</div>
      ) : (
        <>
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
  );

  return (
    <div className="hod-settings">
      {hodWarning && (
        <div className="hod-confirm-overlay">
          <div className="hod-confirm-modal">
            <h3 className="hod-confirm-title">HoD Already Assigned</h3>
            <p className="hod-confirm-body">{hodWarning}</p>
            <div className="hod-confirm-actions">
              <button className="hod-confirm-btn confirm" onClick={() => setHodWarning('')}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hod-settings-header">
        <h2>Head of Department Management</h2>
        <p className="hod-settings-subtitle">
          {selectedDepartment
            ? `Managing ${selectedDepartment.name}`
            : 'Click a department card to manage its HoD'}
        </p>
      </div>

      {error && (
        <div className="hod-settings-alert error">
          {error}
          <button onClick={() => setError('')} className="alert-close">x</button>
        </div>
      )}
      {success && (
        <div className="hod-settings-alert success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">x</button>
        </div>
      )}

      {selectedDepartment ? renderDetail() : renderCards()}
    </div>
  );
};

export default HoDSettings;
