import HRLayout from '../../components/HRLayout';
import '../../styles/SystemMembers.css';

const SystemMembers = () => {
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
            />
            <button className="add-member-btn">+ Add Member</button>
          </div>

          <div className="members-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>0</h3>
                <p>Total Members</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-info">
                <h3>0</h3>
                <p>Departments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>0</h3>
                <p>Active</p>
              </div>
            </div>
          </div>

          <div className="members-table-container">
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Members Found</h3>
              <p>Members will appear here once added to the system</p>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default SystemMembers;
