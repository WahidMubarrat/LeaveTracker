import { useState } from 'react';
import { MdExpandMore, MdDownload } from 'react-icons/md';
import PropTypes from 'prop-types';

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, onDownload, sectionId }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleDownload = (e) => {
        e.stopPropagation(); // Prevent toggle when clicking download
        if (onDownload) {
            onDownload();
        }
    };

    return (
        <div className="collapsible-section">
            <div
                className={`collapsible-header ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="collapsible-title">
                    {Icon && <Icon className="section-icon" />}
                    {title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {onDownload && (
                        <button
                            className="download-btn"
                            onClick={handleDownload}
                            title="Download as PDF"
                            style={{
                                background: '#4a90e2',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: 'white',
                                fontSize: '14px',
                                transition: 'background 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#357abd'}
                            onMouseLeave={(e) => e.target.style.background = '#4a90e2'}
                        >
                            <MdDownload size={18} />
                            PDF
                        </button>
                    )}
                    <MdExpandMore className="collapsible-icon" />
                </div>
            </div>
            <div className={`collapsible-content ${isOpen ? '' : 'collapsed'}`} id={sectionId}>
                {children}
            </div>
        </div>
    );
};

CollapsibleSection.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    children: PropTypes.node.isRequired,
    defaultOpen: PropTypes.bool,
    onDownload: PropTypes.func,
    sectionId: PropTypes.string
};

export default CollapsibleSection;
