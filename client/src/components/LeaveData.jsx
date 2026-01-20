import { useState, useEffect, useCallback } from 'react';
import AnnualLeave from './AnnualLeave';
import CasualLeave from './CasualLeave';
import EmployeeHoliday from './EmployeeHoliday';
import { userAPI } from '../services/api';
import '../styles/LeaveData.css';

const LeaveData = () => {
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaveStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getLeaveStatistics();
      setLeaveData(response.data.leaveData);
      setError(null);
    } catch (err) {
      console.error('Error fetching leave statistics:', err);
      setError('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveStatistics();
  }, [fetchLeaveStatistics]);

  if (loading) {
    return (
      <div className="leave-data-container">
        <div className="loading-spinner">Loading leave data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leave-data-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!leaveData) {
    return null;
  }

  return (
    <div className="leave-data-container">
      <h2 className="leave-data-title">Leave Balance</h2>
      <div className="leave-cards-grid">
        <AnnualLeave
          total={leaveData.annual.total}
          taken={leaveData.annual.taken}
          remaining={leaveData.annual.remaining}
        />
        <CasualLeave
          total={leaveData.casual.total}
          taken={leaveData.casual.taken}
          remaining={leaveData.casual.remaining}
        />
      </div>
      <EmployeeHoliday />
    </div>
  );
};

export default LeaveData;
