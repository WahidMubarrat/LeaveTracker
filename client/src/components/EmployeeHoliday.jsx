import { useState, useEffect } from 'react';
import { vacationAPI } from '../services/api';
import '../styles/EmployeeHoliday.css';

const EmployeeHoliday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const response = await vacationAPI.getAll();
        // Sort holidays by date (upcoming first)
        const sortedHolidays = response.data.holidays.sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        setHolidays(sortedHolidays);
        setError(null);
      } catch (err) {
        console.error('Error fetching holidays:', err);
        setError('Failed to load holidays');
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isPastDate = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="employee-holiday-container">
        <h2 className="holiday-title">Official Holidays</h2>
        <div className="holiday-loading">Loading holidays...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-holiday-container">
        <h2 className="holiday-title">Official Holidays</h2>
        <div className="holiday-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="employee-holiday-container">
      <h2 className="holiday-title">Official Holidays</h2>
      
      {holidays.length === 0 ? (
        <div className="no-holidays">
          <p>No holidays have been set yet.</p>
        </div>
      ) : (
        <div className="holidays-scroll-container">
          {holidays.map((holiday) => (
            <div 
              key={holiday._id} 
              className={`holiday-card ${isPastDate(holiday.date) ? 'past' : 'upcoming'}`}
            >
              <div className="holiday-date-badge">
                <span className="holiday-day">{new Date(holiday.date).getDate()}</span>
                <span className="holiday-month">
                  {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
              <div className="holiday-details">
                <h3 className="holiday-name">{holiday.name}</h3>
                <p className="holiday-date-full">{formatDate(holiday.date)}</p>
                {holiday.description && (
                  <p className="holiday-description">{holiday.description}</p>
                )}
              </div>
              {isPastDate(holiday.date) && (
                <div className="past-badge">Past</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeHoliday;
