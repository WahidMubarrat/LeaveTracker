import HRLayout from '../../components/HRLayout';
import HoDSettings from '../../components/HoDSettings';
import LeaveQuotaSetter from '../../components/LeaveQuotaSetter';
import PublicHoliday from '../../components/PublicHoliday';
import '../../styles/SystemSettings.css';

const SystemSettings = () => {
  return (
    <HRLayout>
      <div className="system-settings-container">
        <div className="page-header">
          <h1>System Settings</h1>
          <p className="page-subtitle">Manage system configurations and preferences</p>
        </div>

        {/* Leave Quota Settings */}
        <LeaveQuotaSetter />

        {/* Head of Department Settings */}
        <HoDSettings />

        {/* Public Holiday Management */}
        <PublicHoliday />
      </div>
    </HRLayout>
  );
};

export default SystemSettings;
