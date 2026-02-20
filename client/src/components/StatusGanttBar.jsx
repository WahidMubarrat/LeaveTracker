import PropTypes from 'prop-types';

const StatusGanttBar = ({ stats, title = "Days Distribution" }) => {
    if (!stats || stats.totalDays === 0) return null;

    const approvedPercent = Math.round((stats.approvedDays / stats.totalDays) * 100);
    const declinedPercent = Math.round((stats.declinedDays / stats.totalDays) * 100);
    const pendingPercent = Math.round((stats.pendingDays / stats.totalDays) * 100);

    return (
        <div className="gantt-summary-container">
            <h4 className="gantt-summary-title">{title}</h4>
            <div className="gantt-summary-bar">
                <div
                    className="gantt-segment approved"
                    style={{ width: `${(stats.approvedDays / stats.totalDays) * 100}%` }}
                    title={`Approved Days: ${stats.approvedDays}`}
                ></div>
                <div
                    className="gantt-segment declined"
                    style={{ width: `${(stats.declinedDays / stats.totalDays) * 100}%` }}
                    title={`Declined Days: ${stats.declinedDays}`}
                ></div>
                <div
                    className="gantt-segment pending"
                    style={{ width: `${(stats.pendingDays / stats.totalDays) * 100}%` }}
                    title={`Pending Days: ${stats.pendingDays}`}
                ></div>
            </div>
            <div className="gantt-summary-legend">
                <div className="gantt-legend-item">
                    <span className="gantt-dot approved"></span>
                    <span>Approved ({approvedPercent}%)</span>
                </div>
                <div className="gantt-legend-item">
                    <span className="gantt-dot declined"></span>
                    <span>Declined ({declinedPercent}%)</span>
                </div>
                <div className="gantt-legend-item">
                    <span className="gantt-dot pending"></span>
                    <span>Pending ({pendingPercent}%)</span>
                </div>
            </div>
        </div>
    );
};

StatusGanttBar.propTypes = {
    stats: PropTypes.shape({
        totalDays: PropTypes.number,
        approvedDays: PropTypes.number,
        declinedDays: PropTypes.number,
        pendingDays: PropTypes.number
    }).isRequired,
    title: PropTypes.string
};

export default StatusGanttBar;
