import { useState } from 'react';
import HRLayout from '../../components/HRLayout';
import HoDSettings from '../../components/HoDSettings';
import LeaveQuotaSetter from '../../components/LeaveQuotaSetter';
import PublicHoliday from '../../components/PublicHoliday';
import { MdChevronRight, MdSettings, MdCalendarToday, MdPeople } from 'react-icons/md';
import '../../styles/SystemSettings.css';

const SystemSettings = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  const sections = [
    {
      id: 'leave-quota',
      title: 'Leave Quota Management',
      description: 'Configure annual and casual leave allocations for all employees',
      icon: MdSettings,
      color: '#4285F4',
      component: LeaveQuotaSetter
    },
    {
      id: 'hod-assignment',
      title: 'HoD Assignment',
      description: 'Assign or remove Head of Department roles by department',
      icon: MdPeople,
      color: '#0F9D58',
      component: HoDSettings
    },
    {
      id: 'public-holidays',
      title: 'Public Holidays',
      description: 'Manage public holidays that affect leave calculations',
      icon: MdCalendarToday,
      color: '#F4B400',
      component: PublicHoliday
    }
  ];

  const handleCardClick = (sectionId) => {
    setSelectedSection(sectionId);
  };

  const handleBackToMain = () => {
    setSelectedSection(null);
  };

  const renderBreadcrumb = () => {
    if (!selectedSection) {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-item active">System Settings</span>
        </div>
      );
    }

    const section = sections.find(s => s.id === selectedSection);
    return (
      <div className="breadcrumb">
        <span className="breadcrumb-item clickable" onClick={handleBackToMain}>
          System Settings
        </span>
        <MdChevronRight className="breadcrumb-separator" />
        <span className="breadcrumb-item active">{section?.title}</span>
      </div>
    );
  };

  const renderMainView = () => (
    <>
      <div className="page-header">
        <h1>System Settings</h1>
        <p className="page-subtitle">Manage system configurations and preferences</p>
      </div>

      <div className="settings-cards-grid">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div 
              key={section.id}
              className="settings-card"
              onClick={() => handleCardClick(section.id)}
              style={{ borderTopColor: section.color }}
            >
              <div className="settings-card-icon" style={{ backgroundColor: section.color }}>
                <IconComponent />
              </div>
              <div className="settings-card-content">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <div className="settings-card-arrow">
                <MdChevronRight />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderSectionView = () => {
    const section = sections.find(s => s.id === selectedSection);
    if (!section) return null;

    const ComponentToRender = section.component;
    return (
      <div className="section-view">
        <ComponentToRender />
      </div>
    );
  };

  return (
    <HRLayout>
      <div className="system-settings-container">
        {renderBreadcrumb()}
        {selectedSection ? renderSectionView() : renderMainView()}
      </div>
    </HRLayout>
  );
};

export default SystemSettings;
