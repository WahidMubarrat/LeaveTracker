import HRLayout from '../../components/HRLayout';
import HoDSetter from '../../components/HoDSetter';
import RoleToggle from '../../components/RoleToggle';
import '../../styles/SystemSettings.css';

const SystemSettings = () => {
  return (
    <HRLayout>
      <div className="system-settings-container">
        <div className="page-header">
          <h1>System Settings</h1>
          <p className="page-subtitle">Manage system configurations and preferences</p>
        </div>

        {/* Role Toggle */}
        <RoleToggle />

        {/* Head of Department Setter */}
        <HoDSetter />

        <div className="settings-grid">
          <div className="setting-card">
            <div className="setting-icon">⚙️</div>
            <h3>General Settings</h3>
            <p>Configure basic system parameters</p>
          </div>

          <div className="setting-card">
            <div className="setting-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Manage email and system notifications</p>
          </div>

          <div className="setting-card">
            <div className="setting-icon">🔐</div>
            <h3>Security</h3>
            <p>Configure security and access controls</p>
          </div>

          <div className="setting-card">
            <div className="setting-icon">📅</div>
            <h3>Leave Policies</h3>
            <p>Set leave quotas and approval rules</p>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default SystemSettings;
