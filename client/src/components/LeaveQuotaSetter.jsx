import { useState, useEffect } from 'react';
import { leaveQuotaAPI } from '../services/api';
import '../styles/LeaveQuotaSetter.css';

const LeaveQuotaSetter = () => {
  const [quotaSettings, setQuotaSettings] = useState({
    annual: 20,
    casual: 10
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await leaveQuotaAPI.getSettings();
      setQuotaSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching quota settings:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load current settings' 
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    if (numValue >= 0 && numValue <= 365) {
      setQuotaSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleUpdateQuota = async () => {
    // Validate input
    if (quotaSettings.annual < 0 || quotaSettings.casual < 0) {
      setMessage({ 
        type: 'error', 
        text: 'Leave days cannot be negative' 
      });
      return;
    }

    if (quotaSettings.annual === 0 && quotaSettings.casual === 0) {
      setMessage({ 
        type: 'error', 
        text: 'At least one leave type must have days allocated' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await leaveQuotaAPI.updateAll(quotaSettings);
      setMessage({ 
        type: 'success', 
        text: `Successfully updated leave quota for ${response.data.updatedCount} users` 
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      console.error('Error updating quota:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update leave quota' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuota = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await leaveQuotaAPI.resetAll();
      setMessage({ 
        type: 'success', 
        text: `Successfully reset used leave quota for ${response.data.resetCount} users` 
      });
      setShowResetConfirm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      console.error('Error resetting quota:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset leave quota' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-quota-setter">
      <div className="quota-header">
        <h2>Leave Quota Settings</h2>
        <p className="quota-description">
          Set the number of leave days allocated to all employees. 
          Changes will apply to all users in the system.
        </p>
      </div>

      {message.text && (
        <div className={`quota-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="quota-form">
        <div className="quota-input-group">
          <label htmlFor="annual">
            <span className="label-text">Annual Leave</span>
            <span className="label-description">Days per year for annual/vacation leave</span>
          </label>
          <input
            type="number"
            id="annual"
            name="annual"
            value={quotaSettings.annual}
            onChange={handleInputChange}
            min="0"
            max="365"
            disabled={loading}
          />
        </div>

        <div className="quota-input-group">
          <label htmlFor="casual">
            <span className="label-text">Casual Leave</span>
            <span className="label-description">Days per year for casual leave</span>
          </label>
          <input
            type="number"
            id="casual"
            name="casual"
            value={quotaSettings.casual}
            onChange={handleInputChange}
            min="0"
            max="365"
            disabled={loading}
          />
        </div>

        <div className="quota-actions">
          <button
            className="btn-primary"
            onClick={handleUpdateQuota}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Leave Quota for All Users'}
          </button>

          <button
            className="btn-secondary"
            onClick={() => setShowResetConfirm(true)}
            disabled={loading}
          >
            Reset Used Leave (New Year)
          </button>
        </div>

        <div className="quota-summary">
          <h3>Current Settings Summary</h3>
          <ul>
            <li>Annual Leave: <strong>{quotaSettings.annual} days</strong></li>
            <li>Casual Leave: <strong>{quotaSettings.casual} days</strong></li>
            <li className="total">Total: <strong>{quotaSettings.annual + quotaSettings.casual} days</strong></li>
          </ul>
        </div>
      </div>

      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Reset</h3>
            <p>
              This will reset all users' used leave days to 0 while keeping their allocated quota.
              This action is typically performed at the start of a new year.
            </p>
            <p className="warning">
              ⚠️ This action cannot be undone. Are you sure?
            </p>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={handleResetQuota}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Yes, Reset All'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowResetConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveQuotaSetter;
