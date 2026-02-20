import { useState, useEffect } from 'react';
import HRLayout from '../../components/HRLayout';
import StatsCard from '../../components/StatsCard';
import BarChart from '../../components/BarChart';
import { analyticsAPI, departmentAPI } from '../../services/api';
import { MdAssessment, MdCheckCircle, MdCancel, MdPending, MdBusiness, MdBarChart, MdTrendingUp, MdGroup, MdHistory, MdExpandMore } from 'react-icons/md';
import '../../styles/Analytics.css';

import CollapsibleSection from '../../components/CollapsibleSection';
import StatusGanttBar from '../../components/StatusGanttBar';

const HRAnalytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [departmentId, setDepartmentId] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [period, year, month, departmentId]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { period, year, departmentId };
      if (period === 'monthly') {
        params.month = month;
      }
      const response = await analyticsAPI.getHRAnalytics(params);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleYearChange = (direction) => {
    setYear(prev => prev + direction);
  };

  const handleMonthChange = (direction) => {
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const getMonthName = (monthNum) => {
    const date = new Date(year, monthNum - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const prepareMonthlyChartData = () => {
    if (!analytics || !analytics.monthlyBreakdown) return [];

    return analytics.monthlyBreakdown.map(month => ({
      label: month.monthName,
      values: [
        { type: 'approved', count: month.approved },
        { type: 'declined', count: month.declined },
        { type: 'pending', count: month.pending }
      ]
    }));
  };

  const prepareDepartmentChartData = () => {
    if (!analytics || !analytics.departmentStats) return [];

    return analytics.departmentStats.slice(0, 6).map(dept => ({
      label: dept.departmentName,
      values: [
        { type: 'approved', count: dept.approved },
        { type: 'declined', count: dept.declined },
        { type: 'pending', count: dept.pending }
      ]
    }));
  };

  if (loading) {
    return (
      <HRLayout>
        <div className="analytics-container">
          <div className="analytics-loading">Loading analytics...</div>
        </div>
      </HRLayout>
    );
  }

  if (error) {
    return (
      <HRLayout>
        <div className="analytics-container">
          <div className="analytics-error">{error}</div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1>Leave Analytics</h1>
            <p className="analytics-subtitle">
              {departmentId === 'all' ? 'All Departments' : departments.find(d => d._id === departmentId)?.name} - {period === 'monthly' ? getMonthName(month) : 'Yearly'} {year}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="analytics-controls">
          <div className="period-toggle">
            <button
              className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('monthly')}
            >
              Monthly
            </button>
            <button
              className={`period-btn ${period === 'yearly' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('yearly')}
            >
              Yearly
            </button>
          </div>

          <div className="department-filter">
            <label htmlFor="department-select">Department:</label>
            <select
              id="department-select"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="department-select"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="date-controls">
            {period === 'monthly' && (
              <div className="month-selector">
                <button onClick={() => handleMonthChange(-1)} className="nav-btn">←</button>
                <span className="date-display">{getMonthName(month)} {year}</span>
                <button onClick={() => handleMonthChange(1)} className="nav-btn">→</button>
              </div>
            )}
            {period === 'yearly' && (
              <div className="year-selector">
                <button onClick={() => handleYearChange(-1)} className="nav-btn">←</button>
                <span className="date-display">{year}</span>
                <button onClick={() => handleYearChange(1)} className="nav-btn">→</button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Key Statistics */}
        <CollapsibleSection title="Key Statistics" icon={MdBarChart} defaultOpen={true}>
          <div className="stats-grid">
            <StatsCard
              icon={MdAssessment}
              title="Total Requests"
              value={analytics?.stats.totalRequests || 0}
              subtitle={`${analytics?.stats.totalDays || 0} total days`}
              color="blue"
            />
            <StatsCard
              icon={MdCheckCircle}
              title="Approved"
              value={analytics?.stats.approved || 0}
              subtitle={`${analytics?.stats.approvedDays || 0} approved days`}
              color="green"
            />
            <StatsCard
              icon={MdCancel}
              title="Declined"
              value={analytics?.stats.declined || 0}
              subtitle={`${analytics?.stats.declinedDays || 0} declined days`}
              color="red"
            />
            <StatsCard
              icon={MdPending}
              title="Pending"
              value={analytics?.stats.pending || 0}
              subtitle={`${analytics?.stats.pendingWithHoD || 0} with HoD`}
              color="purple"
            />
          </div>

          {/* Status Distribution Bar (Gantt-style) based on Days */}
          <StatusGanttBar stats={analytics?.stats} />
        </CollapsibleSection>

        {/* Collapsible Data Visualizations */}
        <CollapsibleSection title="Data Visualizations" icon={MdTrendingUp} defaultOpen={true}>
          <div className="charts-section">
            {/* Monthly Breakdown or Department Comparison */}
            {period === 'yearly' && analytics?.monthlyBreakdown && (
              <BarChart
                data={prepareMonthlyChartData()}
                title="Month-wise Breakdown"
              />
            )}

            {/* Department-wise Comparison (only for all departments view) */}
            {departmentId === 'all' && analytics?.departmentStats && analytics.departmentStats.length > 0 && (
              <BarChart
                data={prepareDepartmentChartData()}
                title="Department-wise Comparison (Top 6)"
              />
            )}

          </div>
        </CollapsibleSection>

        {/* Collapsible Department Statistics Table */}
        {departmentId === 'all' && analytics?.departmentStats && analytics.departmentStats.length > 0 && (
          <CollapsibleSection title="Department-wise Statistics" icon={MdBusiness}>
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Members</th>
                    <th>Total Requests</th>
                    <th>Approved</th>
                    <th>Declined</th>
                    <th>Pending (HR)</th>
                    <th>With HoD</th>
                    <th>Total Days</th>
                    <th>Avg Days/Member</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.departmentStats.map((dept, idx) => (
                    <tr key={idx}>
                      <td><strong>{dept.departmentName}</strong></td>
                      <td>{dept.totalMembers}</td>
                      <td>{dept.totalRequests}</td>
                      <td className="text-green">{dept.approved}</td>
                      <td className="text-red">{dept.declined}</td>
                      <td className="text-purple">{dept.pending}</td>
                      <td className="text-orange">{dept.pendingWithHoD}</td>
                      <td>{dept.totalDays}</td>
                      <td className="highlight">{dept.averageDaysPerMember}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {/* Collapsible Top Employees */}
        <CollapsibleSection title="Top Employees by Leave Days" icon={MdGroup}>
          {analytics?.topEmployees && analytics.topEmployees.length > 0 ? (
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Total Requests</th>
                    <th>Approved Requests</th>
                    <th>Total Days</th>
                    <th>Approved Days</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topEmployees.map((emp, idx) => (
                    <tr key={idx}>
                      <td>{emp.name}</td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.totalRequests}</td>
                      <td>{emp.approvedRequests}</td>
                      <td>{emp.totalDays}</td>
                      <td className="highlight">{emp.approvedDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No employee data available for this period.</p>
          )}
        </CollapsibleSection>

        {/* Collapsible Recent Requests */}
        <CollapsibleSection title="Recent Leave Requests" icon={MdHistory}>
          {analytics?.recentRequests && analytics.recentRequests.length > 0 ? (
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentRequests.map((req, idx) => (
                    <tr key={idx}>
                      <td>{req.employeeName}</td>
                      <td>{req.department}</td>
                      <td>{req.designation}</td>
                      <td>{req.type}</td>
                      <td>{new Date(req.startDate).toLocaleDateString()}</td>
                      <td>{new Date(req.endDate).toLocaleDateString()}</td>
                      <td>{req.numberOfDays}</td>
                      <td>
                        <span className={`status-badge status-${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No recent requests found for this period.</p>
          )}
        </CollapsibleSection>
      </div>
    </HRLayout>
  );
};

export default HRAnalytics;
