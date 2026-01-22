export default function LeaveCard({ leave }) {
  const statusText = leave?.status || "Pending";

  const getStatusClass = () => {
    if (statusText === "Approved") return "approved";
    if (statusText === "Declined") return "rejected";
    return "pending";
  };

  const statusClass = getStatusClass();

  // safe date display
  const start = leave?.startDate ? new Date(leave.startDate).toLocaleDateString() : "";
  const end = leave?.endDate ? new Date(leave.endDate).toLocaleDateString() : "";
  const days = leave?.numberOfDays ?? "";

  const approvalLine = leave?.approvedByHR
    ? "✅ Approved by HR"
    : leave?.approvedByHoD
    ? "⏳ Waiting for HR"
    : "⏳ Waiting for HoD";

  return (
    <div className={`leave-card ${statusClass}`}>
      <div className="leave-card-header">
        <h3 className="leave-title">{(leave?.type || "").toUpperCase()} Leave</h3>
        <span className={`badge ${statusClass}`}>{statusText}</span>
      </div>

      <div className="leave-info">
        <p>📅 {start} → {end}</p>
        <p>⏳ {days} Day(s)</p>
        <p>{approvalLine}</p>
      </div>
    </div>
  );
}
