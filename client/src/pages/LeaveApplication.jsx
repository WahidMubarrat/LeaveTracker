import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import '../styles/LeaveApplication.css';

const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
    backupEmployeeId: '',
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartmentMembers();
  }, []);

  const fetchDepartmentMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/department-members', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/leaves/apply',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess('Leave application submitted successfully!');
      // Reset form
      setFormData({
        type: 'Annual',
        startDate: '',
        endDate: '',
        reason: '',
        backupEmployeeId: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  return (
    <Layout>
      <div className="application-container">
        <div className="application-header">
          <h1>Apply for Leave</h1>
          <p className="application-subtitle">Submit your leave application</p>
        </div>

        <div className="application-content">
          <div className="application-card">
            {error && <div className="application-error">{error}</div>}
            {success && <div className="application-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Leave Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="backupEmployeeId">Backup Employee</label>
                  <select
                    id="backupEmployeeId"
                    name="backupEmployeeId"
                    value={formData.backupEmployeeId}
                    onChange={handleChange}
                  >
                    <option value="">Select Backup (Optional)</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="days-info">
                  <span className="days-label">Total Days:</span>
                  <span className="days-value">{calculateDays()} days</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Provide a reason for your leave application (optional)"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setFormData({
                      type: 'Annual',
                      startDate: '',
                      endDate: '',
                      reason: '',
                      backupEmployeeId: '',
                    });
                    setError('');
                    setSuccess('');
                  }}
                >
                  Clear
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaveApplication;
