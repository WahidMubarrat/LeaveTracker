import { useState } from 'react';
import { MdExpandMore } from 'react-icons/md';
import PropTypes from 'prop-types';

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

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
                <MdExpandMore className="collapsible-icon" />
            </div>
            <div className={`collapsible-content ${isOpen ? '' : 'collapsed'}`}>
                {children}
            </div>
        </div>
    );
};

CollapsibleSection.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    children: PropTypes.node.isRequired,
    defaultOpen: PropTypes.bool
};

export default CollapsibleSection;
