import { useState, useEffect } from 'react';
import { vacationAPI } from '../services/api';
import '../styles/PublicHoliday.css';

const PublicHoliday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    numberOfDays: 1
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await vacationAPI.getAll();
      setHolidays(response.data.holidays || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfDays' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name.trim()) {
      setError('Holiday name is required');
      return;
    }

    if (!formData.date) {
      setError('Holiday date is required');
      return;
    }

    if (formData.numberOfDays < 1) {
      setError('Number of days must be at least 1');
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        // Update existing holiday
        await vacationAPI.update(editingId, formData);
        setSuccess('Holiday updated successfully');
      } else {
        // Create new holiday
        await vacationAPI.create(formData);
        setSuccess('Holiday added successfully');
      }

      // Reset form
      setFormData({
        name: '',
        date: '',
        numberOfDays: 1
      });
      setEditingId(null);
      
      // Refresh holidays list
      await fetchHolidays();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving holiday:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save holiday';
      setError(errorMessage);
      console.error('Full error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (holiday) => {
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      numberOfDays: holiday.numberOfDays
    });
    setEditingId(holiday._id);
    setError('');
    setSuccess('');
    
    // Scroll to form
    document.querySelector('.holiday-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      date: '',
      numberOfDays: 1
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await vacationAPI.delete(holidayId);
      setSuccess('Holiday deleted successfully');
      await fetchHolidays();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting holiday:', err);
      setError(err.response?.data?.message || 'Failed to delete holiday');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="public-holiday">
      <div className="holiday-header">
        <h2>Public Holiday Management</h2>
        <p className="holiday-subtitle">
          Add and manage public holidays. These holidays will be automatically excluded from leave calculations.
        </p>
      </div>

      {error && (
        <div className="holiday-alert error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="holiday-alert success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      <div className="holiday-form">
        <h3>{editingId ? 'Edit Holiday' : 'Add New Holiday'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Holiday Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Independence Day"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="numberOfDays">Number of Days *</label>
              <input
                type="number"
                id="numberOfDays"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingId ? 'Update Holiday' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>

      <div className="holiday-list">
        <h3>Existing Holidays</h3>
        {loading && holidays.length === 0 ? (
          <div className="loading-state">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="empty-state">No holidays added yet</div>
        ) : (
          <div className="holidays-table">
            <table>
              <thead>
                <tr>
                  <th>Holiday Name</th>
                  <th>Date</th>
                  <th>Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(holiday => (
                  <tr key={holiday._id}>
                    <td>{holiday.name}</td>
                    <td>{formatDate(holiday.date)}</td>
                    <td>{holiday.numberOfDays} {holiday.numberOfDays === 1 ? 'day' : 'days'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(holiday)}
                          disabled={loading || editingId === holiday._id}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(holiday._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicHoliday;

