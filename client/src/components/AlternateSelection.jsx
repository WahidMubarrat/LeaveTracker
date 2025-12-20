import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import '../styles/AlternateSelection.css';

const AlternateSelection = ({ value, onChange, required = false }) => {
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

  return (
    <div className="alternate-selection">
      <label htmlFor="backupEmployee">
        Alternate Employee {required && '*'}
      </label>
      <select
        id="backupEmployee"
        name="backupEmployeeId"
        value={value}
        onChange={onChange}
        required={required}
        disabled={loading}
      >
        <option value="">
          {loading ? 'Loading...' : 'Select Alternate Employee'}
        </option>
        {members.map((member) => (
          <option key={member._id} value={member._id}>
            {member.name} - {member.designation || member.role}
          </option>
        ))}
      </select>
      {error && <span className="alternate-error">{error}</span>}
    </div>
  );
};

export default AlternateSelection;
