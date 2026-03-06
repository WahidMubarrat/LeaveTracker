import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { MdSearch } from 'react-icons/md';
import { userAPI } from '../services/api';
import Status from './Status';

const CollegueInfo = ({ onMembersLoaded }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');

  useEffect(() => {
    let isActive = true;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await userAPI.getDepartmentMembers();
        const memberList = data?.members ?? [];

        if (!isActive) return;

        setMembers(memberList);
        onMembersLoaded?.(memberList);
      } catch (err) {
        if (!isActive) return;

        console.error('Failed to fetch department members:', err);
        const message = err.response?.data?.message || 'Failed to load members';
        setError(message);
        setMembers([]);
        onMembersLoaded?.([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isActive = false;
    };
  }, [onMembersLoaded]);

  // top-4 unique designations from loaded members
  const designationOptions = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const m of members) {
      if (m.designation && !seen.has(m.designation)) {
        seen.add(m.designation);
        result.push(m.designation);
        if (result.length === 4) break;
      }
    }
    return result;
  }, [members]);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members
      .filter((m) => {
        if (term && !m.name?.toLowerCase().includes(term) && !m.email?.toLowerCase().includes(term)) return false;
        if (statusFilter === 'OnLeave' && m.currentStatus !== 'OnLeave') return false;
        if (statusFilter === 'OnDuty' && m.currentStatus === 'OnLeave') return false;
        if (designationFilter !== 'All' && m.designation !== designationFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const aIsHoD = a.roles?.includes('HoD');
        const bIsHoD = b.roles?.includes('HoD');
        if (aIsHoD && !bIsHoD) return -1;
        if (!aIsHoD && bIsHoD) return 1;
        return 0;
      });
  }, [members, search, statusFilter, designationFilter]);

  if (loading) {
    return <div className="members-loading">Loading members...</div>;
  }

  return (
    <>
      {error && <div className="members-error">{error}</div>}

      {members.length > 0 ? (
        <div className="members-list-wrapper">

          {/* ── Search + Filters ── */}
          <div className="members-actions">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input
                className="search-input"
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-container">
              <div className="filter-group">
                <label className="filter-label">Leave Status:</label>
                <div className="filter-buttons">
                  {['All', 'On Duty', 'On Leave'].map((s) => (
                    <button
                      key={s}
                      className={`filter-btn ${
                        (s === 'All' && statusFilter === 'All') ||
                        (s === 'On Duty' && statusFilter === 'OnDuty') ||
                        (s === 'On Leave' && statusFilter === 'OnLeave')
                          ? 'active' : ''
                      }`}
                      onClick={() => {
                        if (s === 'All') setStatusFilter('All');
                        else if (s === 'On Duty') setStatusFilter((v) => v === 'OnDuty' ? 'All' : 'OnDuty');
                        else setStatusFilter((v) => v === 'OnLeave' ? 'All' : 'OnLeave');
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {designationOptions.length > 0 && (
                <div className="filter-group">
                  <label className="filter-label">Designation:</label>
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${designationFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setDesignationFilter('All')}
                    >All</button>
                    {designationOptions.map((d) => (
                      <button
                        key={d}
                        className={`filter-btn ${designationFilter === d ? 'active' : ''}`}
                        onClick={() => setDesignationFilter((v) => (v === d ? 'All' : d))}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
                {filteredMembers.map((member) => (
                    <tr key={member._id} className={member.currentStatus === 'OnLeave' ? 'on-leave-row' : ''}>
                      <td className="member-name-cell">
                        <div className="member-avatar-small">
                          {member.profilePic ? (
                            <img src={member.profilePic} alt={member.name} />
                          ) : (
                            <span>{member.name?.charAt(0).toUpperCase()}</span>
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
                      <td>{member.designation || 'N/A'}</td>
                      <td>
                        <Status
                          currentStatus={member.currentStatus === 'OnLeave' ? 'On Leave' : 'On Duty'}
                          returnDate={member.currentLeave?.endDate}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !error && (
          <div className="members-empty">
            <p>No members found in your department</p>
          </div>
        )
      )}
    </>
  );
};

CollegueInfo.propTypes = {
  onMembersLoaded: PropTypes.func,
};

export default CollegueInfo;
