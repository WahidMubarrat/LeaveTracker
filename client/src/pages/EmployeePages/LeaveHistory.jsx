import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import LeaveCard from "../../components/LeaveCard";
import { leaveAPI } from "../../services/api";
import "../../styles/LeaveHistory.css";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ✅ correct for Employee: /api/leaves/my-applications
        const res = await leaveAPI.getMyApplications();
        setLeaves(res.data?.applications || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load leave history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const statusMatch = statusFilter === "All" || leave.status === statusFilter;
      const typeMatch = typeFilter === "All" || leave.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [leaves, statusFilter, typeFilter]);

  return (
    <Layout>
      <div className="leave-history-page">
        <h2>My Leave History</h2>

        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="annual">Annual</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && filteredLeaves.length === 0 && (
          <div className="empty-state">
            <h3>No Leave History Found</h3>
            <p>Your leave requests will appear here.</p>
          </div>
        )}

        <div className="leave-grid">
          {filteredLeaves.map((leave) => (
            <LeaveCard key={leave._id} leave={leave} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
