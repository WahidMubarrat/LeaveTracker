import { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import AlternateSelection from '../../components/AlternateSelection';
import { AuthContext } from '../../context/AuthContext';
import { leaveAPI } from '../../services/api';
import '../../styles/LeaveApplication.css';

const LeaveApplication = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    applicationDate: new Date().toISOString().split('T')[0],
    applicantName: user?.name || '',
    departmentName: user?.department?.name || '',
    applicantDesignation: user?.designation || '',
    type: 'Casual',
    startDate: '',
    endDate: '',
    numberOfDays: '',
    reason: '',
    backupEmployeeId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        applicantName: user.name || '',
        departmentName: user.department?.name || '',
        applicantDesignation: user.designation || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate days when dates change
    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? value : formData.startDate;
      const end = name === 'endDate' ? value : formData.endDate;
      
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        if (days > 0) {
          setFormData(prev => ({
            ...prev,
            numberOfDays: days.toString(),
          }));
        }
      }
    }
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
      const response = await leaveAPI.applyLeave(formData);
      setSuccess('Leave application submitted successfully!');
      
      // Reset form
      setFormData({
        applicationDate: new Date().toISOString().split('T')[0],
        applicantName: user?.name || '',
        departmentName: user?.department?.name || '',
        applicantDesignation: user?.designation || '',
        type: 'Casual',
        startDate: '',
        endDate: '',
        numberOfDays: '',
        reason: '',
        backupEmployeeId: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      applicationDate: new Date().toISOString().split('T')[0],
      applicantName: user?.name || '',
      departmentName: user?.department?.name || '',
      applicantDesignation: user?.designation || '',
      type: 'Casual',
      startDate: '',
      endDate: '',
      numberOfDays: '',
      reason: '',
      backupEmployeeId: '',
    });
    setError('');
    setSuccess('');
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
              {/* Application Date */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="applicationDate">Application Date *</label>
                  <input
                    type="date"
                    id="applicationDate"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="applicantName">Name of Applicant *</label>
                  <input
                    type="text"
                    id="applicantName"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              {/* Department and Designation */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departmentName">Department *</label>
                  <input
                    type="text"
                    id="departmentName"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    placeholder="Your department"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="applicantDesignation">Designation *</label>
                  <input
                    type="text"
                    id="applicantDesignation"
                    name="applicantDesignation"
                    value={formData.applicantDesignation}
                    onChange={handleChange}
                    placeholder="Your designation"
                    required
                  />
                </div>
              </div>

              {/* Nature of Leave */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Nature of Leave *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Annual">Annual Leave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="numberOfDays">Number of Days *</label>
                  <input
                    type="number"
                    id="numberOfDays"
                    name="numberOfDays"
                    value={formData.numberOfDays}
                    onChange={handleChange}
                    min="1"
                    placeholder="Auto-calculated"
                    required
                  />
                </div>
              </div>

              {/* Period of Leave */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">From Date *</label>
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
                  <label htmlFor="endDate">To Date *</label>
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

              {/* Purpose of Leave */}
              <div className="form-group">
                <label htmlFor="reason">Purpose of Leave *</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the purpose of your leave"
                  required
                />
              </div>

              {/* Alternate Selection */}
              <div className="form-group">
                <AlternateSelection
                  value={formData.backupEmployeeId}
                  onChange={handleChange}
                  required={false}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClear}
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
