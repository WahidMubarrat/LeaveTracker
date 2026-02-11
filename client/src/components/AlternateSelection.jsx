import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import '../styles/AlternateSelection.css';

const AlternateSelection = ({
  selectedAlternates = [],
  onSelectionChange,
  required = false,
  leaveStartDate,
  leaveEndDate
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (leaveStartDate && leaveEndDate) {
      fetchAlternateOptions();
    } else {
      setMembers([]);
    }
  }, [leaveStartDate, leaveEndDate]);

  const fetchAlternateOptions = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAlternateOptions(leaveStartDate, leaveEndDate);
      setMembers(response.data.members || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch alternate options:', err);
      setError('Failed to load available department members');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (memberId) => {
    const existingIndex = selectedAlternates.findIndex(alt => alt.employeeId === memberId);
    let newSelection;

    if (existingIndex !== -1) {
      newSelection = selectedAlternates.filter(alt => alt.employeeId !== memberId);
    } else {
      // Add member with default dates (the full leave period)
      newSelection = [...selectedAlternates, {
        employeeId: memberId,
        startDate: leaveStartDate,
        endDate: leaveEndDate
      }];
    }

    onSelectionChange(newSelection);
  };

  const handleDateChange = (memberId, field, value) => {
    const newSelection = selectedAlternates.map(alt => {
      if (alt.employeeId === memberId) {
        return { ...alt, [field]: value };
      }
      return alt;
    });
    onSelectionChange(newSelection);
  };

  const getMemberName = (id) => {
    const member = members.find(m => m._id === id);
    return member ? member.name : 'Unknown';
  };

  if (!leaveStartDate || !leaveEndDate) {
    return (
      <div className="alternate-selection">
        <label>Alternate Employees {required && '*'}</label>
        <div className="alternate-hint-dates">Please select leave dates first to see available alternates.</div>
      </div>
    );
  }

  return (
    <div className="alternate-selection">
      <label>
        Alternate Employees {required && '*'}
        <span className="alternate-hint">(Select members and assign their coverage dates)</span>
      </label>

      {loading ? (
        <div className="alternate-loading">Loading available department members...</div>
      ) : (
        <>
          {members.length === 0 ? (
            <div className="alternate-empty">No eligible members available for these dates.</div>
          ) : (
            <div className="alternate-checkbox-list">
              {members.map((member) => {
                const selection = selectedAlternates.find(alt => alt.employeeId === member._id);
                const isSelected = !!selection;

                return (
                  <div key={member._id} className="alternate-item-wrapper">
                    <label className={`alternate-checkbox-item ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(member._id)}
                      />
                      <span className="alternate-member-name">
                        {member.name} - {member.designation}
                      </span>
                    </label>

                    {isSelected && (
                      <div className="alternate-date-inputs">
                        <div className="alt-date-field">
                          <span>From:</span>
                          <input
                            type="date"
                            value={selection.startDate}
                            min={leaveStartDate}
                            max={leaveEndDate}
                            onChange={(e) => handleDateChange(member._id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="alt-date-field">
                          <span>To:</span>
                          <input
                            type="date"
                            value={selection.endDate}
                            min={selection.startDate}
                            max={leaveEndDate}
                            onChange={(e) => handleDateChange(member._id, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedAlternates.length > 0 && (
            <div className="alternate-selected-summary">
              <strong>Coverage Plan ({selectedAlternates.length}):</strong>
              <div className="coverage-list">
                {selectedAlternates.map(alt => (
                  <div key={alt.employeeId} className="coverage-badge">
                    {getMemberName(alt.employeeId)}: {alt.startDate} to {alt.endDate}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <span className="alternate-error">{error}</span>}
    </div>
  );
};

export default AlternateSelection;
