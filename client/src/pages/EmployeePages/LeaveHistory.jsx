
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import { leaveAPI } from "../../services/api";
import "../../styles/LeaveHistory.css";

function computeDisplayStatus(lr) {
  if (lr.status === "Declined") return { text: "Declined", cls: "declined" };

  if (lr.approvedByHR || lr.status === "Approved")
    return { text: "Approved (Final)", cls: "approved" };

  if (lr.approvedByHoD && !lr.approvedByHR)
    return { text: "Approved by HoD", cls: "hod" };

  return { text: "Pending", cls: "pending" };
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function LeaveHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [year, setYear] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchMy = async () => {
    try {
      setError("");
      const res = await leaveAPI.getMyApplications(); // only my applications
      setItems(res.data.applications || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMy();
    const t = setInterval(fetchMy, 10000);
    return () => clearInterval(t);
  }, []);

  const yearOptions = useMemo(() => {
    const years = new Set();
    items.forEach((a) => {
      const y = new Date(a.applicationDate || a.createdAt).getFullYear();
      if (!Number.isNaN(y)) years.add(String(y));
    });
    return ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const y = String(new Date(a.applicationDate || a.createdAt).getFullYear());
      const st = computeDisplayStatus(a).text;

      const yearOk = year === "All" || y === year;

      let statusOk = true;
      if (statusFilter === "All") statusOk = true;
      else if (statusFilter === "Pending") statusOk = st === "Pending";
      else if (statusFilter === "Approved") statusOk = st.includes("Approved");
      else if (statusFilter === "Declined") statusOk = st === "Declined";

      return yearOk && statusOk;
    });
  }, [items, year, statusFilter]);

  const openDetails = async (leave) => {
    setSelected(leave);
    setOpen(true);
    setLogs([]);
    setLogsLoading(true);

    try {
      const res = await leaveAPI.getLeaveRequestLogs(leave._id);
      setLogs(res.data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const closeDetails = () => {
    setOpen(false);
    setSelected(null);
    setLogs([]);
  };

  return (
    <Layout>
      <div className="lh-page">
        <div className="lh-header">
          <div>
            <h1 className="lh-title">Leave History</h1>
            <p className="lh-subtitle">View all your past and current leave applications</p>
          </div>

          <div className="lh-filters">
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Status All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

import { useState } from 'react';
import Layout from '../../components/Layout';
import '../../styles/LeaveHistory.css';

const LeaveHistory = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Dummy data
  const dummyHistory = [
    {
      id: 1,
      leaveType: 'Annual',
      applicationDate: '2026-01-10',
      startDate: '2026-01-15',
      endDate: '2026-01-19',
      numberOfDays: 5,
      reason: 'Family vacation',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2026-01-11'
    },
    {
      id: 2,
      leaveType: 'Casual',
      applicationDate: '2026-01-05',
      startDate: '2026-01-08',
      endDate: '2026-01-09',
      numberOfDays: 2,
      reason: 'Personal work',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2026-01-06'
    },
    {
      id: 3,
      leaveType: 'Annual',
      applicationDate: '2025-12-20',
      startDate: '2025-12-25',
      endDate: '2025-12-29',
      numberOfDays: 5,
      reason: 'Holiday trip',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-12-21'
    },
    {
      id: 4,
      leaveType: 'Casual',
      applicationDate: '2025-12-15',
      startDate: '2025-12-18',
      endDate: '2025-12-18',
      numberOfDays: 1,
      reason: 'Doctor appointment',
      status: 'Declined',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-12-16',
      remarks: 'Please reschedule to a less busy period'
    },
    {
      id: 5,
      leaveType: 'Annual',
      applicationDate: '2025-11-28',
      startDate: '2025-12-02',
      endDate: '2025-12-06',
      numberOfDays: 5,
      reason: 'Attending conference',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-11-29'
    },
    {
      id: 6,
      leaveType: 'Casual',
      applicationDate: '2025-11-10',
      startDate: '2025-11-15',
      endDate: '2025-11-16',
      numberOfDays: 2,
      reason: 'Family emergency',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-11-11'
    },
    {
      id: 7,
      leaveType: 'Annual',
      applicationDate: '2025-10-20',
      startDate: '2025-10-25',
      endDate: '2025-10-27',
      numberOfDays: 3,
      reason: 'Personal travel',
      status: 'Approved',
      approvedBy: 'Dr. Md. Hasanul Kabir',
      approvedDate: '2025-10-21'
    }
  ];

  const filteredHistory = dummyHistory.filter(leave => {
    const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
    const matchesType = filterType === 'All' || leave.leaveType === filterType;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: dummyHistory.length,
    approved: dummyHistory.filter(l => l.status === 'Approved').length,
    declined: dummyHistory.filter(l => l.status === 'Declined').length,
    totalDays: dummyHistory.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.numberOfDays, 0)
  };

  return (
    <Layout>
      <div className="history-container">
        <div className="history-header">
          <h1>Leave History</h1>
          <p className="history-subtitle">View all your past leave applications</p>
        </div>

        <div className="history-stats">
          <div className="stat-box">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.declined}</h3>
              <p>Declined</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalDays}</h3>
              <p>Days Taken</p>
            </div>
          </div>
        </div>

        <div className="history-filters">
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Annual">Annual Leave</option>
            <option value="Casual">Casual Leave</option>
          </select>
        </div>

        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon">📭</div>
              <p>No leave history found</p>
              <p className="empty-subtitle">Try adjusting your filters</p>
            </div>
          ) : (
            filteredHistory.map(leave => (
              <div key={leave.id} className="history-card">
                <div className="history-card-header">
                  <div className="leave-info">
                    <span className={`leave-type-badge type-${leave.leaveType.toLowerCase()}`}>
                      {leave.leaveType}
                    </span>
                    <span className={`status-badge-history status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="leave-dates">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="history-card-body">
                  <div className="history-detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{leave.numberOfDays} day{leave.numberOfDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="history-detail">
                    <span className="detail-label">Application Date:</span>
                    <span className="detail-value">{new Date(leave.applicationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="history-detail">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{leave.reason}</span>
                  </div>
                  {leave.status === 'Approved' && (
                    <>
                      <div className="history-detail">
                        <span className="detail-label">Approved By:</span>
                        <span className="detail-value">{leave.approvedBy}</span>
                      </div>
                      <div className="history-detail">
                        <span className="detail-label">Approved Date:</span>
                        <span className="detail-value">{new Date(leave.approvedDate).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                  {leave.status === 'Declined' && leave.remarks && (
                    <div className="history-detail remarks">
                      <span className="detail-label">Remarks:</span>
                      <span className="detail-value">{leave.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

        </div>

        {loading ? (
          <div className="lh-state">Loading...</div>
        ) : error ? (
          <div className="lh-error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="lh-empty">
            <div className="lh-empty-card">
              <div className="lh-empty-emoji">📄</div>
              <h3>No Leave History Found</h3>
              <p>Your approved or rejected leaves will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="lh-list">
            {filtered.map((l) => {
              const st = computeDisplayStatus(l);
              return (
                <div key={l._id} className="lh-card">
                  <div className="lh-icon">📅</div>

                  <div className="lh-content">
                    <div className="lh-row1">
                      <h3 className="lh-leave-title">{l.type} Leave</h3>
                      <span className={`lh-status ${st.cls}`}>{st.text}</span>
                    </div>

                    <div className="lh-dates">
                      {formatDate(l.startDate)} — {formatDate(l.endDate)}
                    </div>

                    <div className="lh-meta">
                      <span><b>Days:</b> {l.numberOfDays ?? "-"}</span>
                      <span><b>Applied:</b> {formatDate(l.applicationDate || l.createdAt)}</span>
                      <span><b>Department:</b> {l.departmentName || l.department?.name || "-"}</span>
                    </div>
                  </div>

                  <div className="lh-actions">
                    <button className="lh-btn" onClick={() => openDetails(l)}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {open && (
          <div className="lh-modal-overlay" onClick={closeDetails}>
            <div className="lh-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lh-modal-head">
                <div>
                  <h3 className="lh-modal-title">Leave Details</h3>
                  <p className="lh-modal-sub">Timeline of approvals/remarks</p>
                </div>
                <button className="lh-x" onClick={closeDetails}>✕</button>
              </div>

              {selected && (
                <div className="lh-summary">
                  <div><b>Type:</b> {selected.type}</div>
                  <div><b>Dates:</b> {formatDate(selected.startDate)} → {formatDate(selected.endDate)}</div>
                  <div><b>Days:</b> {selected.numberOfDays ?? "-"}</div>
                  <div><b>Reason:</b> {selected.reason || "-"}</div>
                </div>
              )}

              <div className="lh-divider" />

              <h4 className="lh-timeline-title">Timeline</h4>

              {logsLoading ? (
                <p className="lh-state">Loading timeline...</p>
              ) : logs.length === 0 ? (
                <p className="lh-state">No timeline logs found.</p>
              ) : (
                <ul className="lh-logs">
                  {logs.map((log) => (
                    <li key={log._id} className="lh-log">
                      <div className="lh-log-top">
                        <span className="lh-log-action">{log.action}</span>
                        <span className="lh-log-time">{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="lh-log-by">
                        By: {log.performedBy?.name || "System"}
                      </div>
                      {log.notes ? <div className="lh-log-notes">Remarks: {log.notes}</div> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
