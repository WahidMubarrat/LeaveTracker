import { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import AlternateSelection from '../../components/AlternateSelection';
import LeaveDocument from '../../components/LeaveDocument';
import WarningTooltip from '../../components/WarningTooltip';
import { AuthContext } from '../../context/AuthContext';
import { leaveAPI, vacationAPI } from '../../services/api';
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
    alternateEmployeeIds: [],
    leaveDocument: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: { allocated: 20, used: 0 },
    casual: { allocated: 10, used: 0 }
  });
  const [balanceWarning, setBalanceWarning] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        applicantName: user.name || '',
        departmentName: user.department?.name || '',
        applicantDesignation: user.designation || '',
      }));
      
      // Set leave balance from user data
      if (user.leaveQuota) {
        setLeaveBalance({
          annual: user.leaveQuota.annual || { allocated: 20, used: 0 },
          casual: user.leaveQuota.casual || { allocated: 10, used: 0 }
        });
      }
    }
  }, [user]);

  // Fetch holidays when dates change
  useEffect(() => {
    const fetchHolidays = async () => {
      if (formData.startDate && formData.endDate) {
        try {
          const response = await vacationAPI.getInRange(formData.startDate, formData.endDate);
          const fetchedHolidays = response.data.holidays || [];
          setHolidays(fetchedHolidays);
          
          // Recalculate days after fetching holidays
          const startDate = new Date(formData.startDate);
          const endDate = new Date(formData.endDate);
          
          if (endDate >= startDate) {
            const weekdays = calculateWeekdays(startDate, endDate, fetchedHolidays);
            setFormData(prev => ({
              ...prev,
              numberOfDays: weekdays.toString(),
            }));
          }
        } catch (err) {
          console.error('Error fetching holidays:', err);
          setHolidays([]);
          // Still calculate without holidays if fetch fails
          if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            if (endDate >= startDate) {
              const weekdays = calculateWeekdays(startDate, endDate, []);
              setFormData(prev => ({
                ...prev,
                numberOfDays: weekdays.toString(),
              }));
            }
          }
        }
      } else {
        setHolidays([]);
      }
    };

    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate]);

  // Check leave balance warning when numberOfDays or type changes
  useEffect(() => {
    if (formData.numberOfDays && parseInt(formData.numberOfDays) > 0) {
      const requestedDays = parseInt(formData.numberOfDays);
      const leaveType = formData.type.toLowerCase(); // 'casual' or 'annual'
      
      // Check casual leave 2-day limit first
      if (leaveType === 'casual' && requestedDays > 2) {
        setBalanceWarning(
          `Casual leave cannot exceed 2 consecutive days. You are requesting ${requestedDays} days. ` +
          `Please apply for Annual Leave instead.`
        );
        return;
      }
      
      // Check leave balance
      const balance = leaveBalance[leaveType];
      const remaining = balance.allocated - balance.used;
      
      if (requestedDays > remaining) {
        setBalanceWarning(
          `You are requesting ${requestedDays} days but only have ${remaining} ${formData.type} leave days remaining. ` +
          `Your request exceeds available balance by ${requestedDays - remaining} days.`
        );
      } else {
        setBalanceWarning('');
      }
    } else {
      setBalanceWarning('');
    }
  }, [formData.numberOfDays, formData.type, leaveBalance]);

  // Helper function to check if a date falls within a holiday period
  const isHoliday = (date, holidaysList) => {
    if (!holidaysList || holidaysList.length === 0) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return holidaysList.some(holiday => {
      const holidayStartDate = new Date(holiday.date);
      holidayStartDate.setHours(0, 0, 0, 0);
      const holidayEndDate = new Date(holidayStartDate);
      holidayEndDate.setDate(holidayEndDate.getDate() + holiday.numberOfDays - 1);
      holidayEndDate.setHours(23, 59, 59, 999);
      
      return checkDate >= holidayStartDate && checkDate <= holidayEndDate;
    });
  };

  // Helper function to calculate weekdays excluding weekends and holidays
  const calculateWeekdays = (startDate, endDate, holidaysList = []) => {
    let count = 0;
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      // Only count weekdays that are not holidays
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(current, holidaysList)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate weekdays when dates change (before holidays are fetched)
    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? value : formData.startDate;
      const end = name === 'endDate' ? value : formData.endDate;
      
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (endDate >= startDate) {
          // Calculate weekdays excluding weekends and holidays (using current holidays)
          const weekdays = calculateWeekdays(startDate, endDate, holidays);
          setFormData(prev => ({
            ...prev,
            numberOfDays: weekdays.toString(),
          }));
        }
      }
    }
  };

  const handleAlternateSelectionChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      alternateEmployeeIds: selectedIds,
    }));
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
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('applicationDate', formData.applicationDate);
      submitData.append('applicantName', formData.applicantName);
      submitData.append('departmentName', formData.departmentName);
      submitData.append('applicantDesignation', formData.applicantDesignation);
      submitData.append('type', formData.type);
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('numberOfDays', formData.numberOfDays);
      submitData.append('reason', formData.reason);
      
      if (formData.backupEmployeeId) {
        submitData.append('backupEmployeeId', formData.backupEmployeeId);
      }
      
      // Append alternate employee IDs as JSON string
      if (formData.alternateEmployeeIds && formData.alternateEmployeeIds.length > 0) {
        submitData.append('alternateEmployeeIds', JSON.stringify(formData.alternateEmployeeIds));
      }
      
      // Append leave document file if provided
      if (formData.leaveDocument) {
        submitData.append('leaveDocument', formData.leaveDocument);
      }

      const response = await leaveAPI.applyLeave(submitData);
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
        alternateEmployeeIds: [],
        leaveDocument: null,
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
      alternateEmployeeIds: [],
      leaveDocument: null,
    });
    setError('');
    setSuccess('');
  };

  const handleDocumentChange = (document) => {
    setFormData(prev => ({
      ...prev,
      leaveDocument: document,
    }));
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
                    readOnly
                    disabled
                    className="readonly-field"
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
                    readOnly
                    disabled
                    className="readonly-field"
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
                    readOnly
                    disabled
                    className="readonly-field"
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
                    readOnly
                    disabled
                    className="readonly-field"
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
                    <option value="Casual">
                      Casual Leave ({leaveBalance.casual.allocated - leaveBalance.casual.used} remaining)
                    </option>
                    <option value="Annual">
                      Annual Leave ({leaveBalance.annual.allocated - leaveBalance.annual.used} remaining)
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="numberOfDays">Number of Weekdays *</label>
                  <div className="input-with-tooltip">
                    <input
                      type="number"
                      id="numberOfDays"
                      name="numberOfDays"
                      value={formData.numberOfDays}
                      readOnly
                      disabled
                      className="readonly-field"
                      min="1"
                      placeholder="Auto-calculated"
                      required
                    />
                    <WarningTooltip message={balanceWarning} show={!!balanceWarning} />
                  </div>
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

              {/* Leave Document */}
              <div className="form-group">
                <LeaveDocument
                  onDocumentChange={handleDocumentChange}
                  initialDocument={formData.leaveDocument}
                />
              </div>

              {/* Alternate Selection */}
              <div className="form-group">
                <AlternateSelection
                  selectedAlternates={formData.alternateEmployeeIds}
                  onSelectionChange={handleAlternateSelectionChange}
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
