import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import '../styles/AlternateSelection.css';

const AlternateSelection = ({ selectedAlternates = [], onSelectionChange, required = false }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlternateOptions();
  }, []);

  const fetchAlternateOptions = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAlternateOptions();
      setMembers(response.data.members || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch alternate options:', err);
      setError('Failed to load department members');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (memberId) => {
    const isSelected = selectedAlternates.includes(memberId);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedAlternates.filter(id => id !== memberId);
    } else {
      newSelection = [...selectedAlternates, memberId];
    }
    
    onSelectionChange(newSelection);
  };

  const getSelectedMemberNames = () => {
    return selectedAlternates
      .map(id => {
        const member = members.find(m => m._id === id);
        return member ? member.name : null;
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="alternate-selection">
      <label>
        Alternate Employees {required && '*'}
        <span className="alternate-hint">(You can select multiple)</span>
      </label>
      
      {loading ? (
        <div className="alternate-loading">Loading department members...</div>
      ) : (
        <>
          <div className="alternate-checkbox-list">
            {members.map((member) => {
              const isSelected = selectedAlternates.includes(member._id);
              return (
                <label key={member._id} className="alternate-checkbox-item">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(member._id)}
                  />
                  <span className="alternate-member-name">
                    {member.name} - {member.designation || member.role}
                  </span>
                </label>
              );
            })}
          </div>
          
          {selectedAlternates.length > 0 && (
            <div className="alternate-selected-summary">
              <strong>Selected ({selectedAlternates.length}):</strong> {getSelectedMemberNames()}
            </div>
          )}
        </>
      )}
      
      {error && <span className="alternate-error">{error}</span>}
    </div>
  );
};

export default AlternateSelection;
