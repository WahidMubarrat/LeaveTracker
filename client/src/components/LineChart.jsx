import PropTypes from 'prop-types';
import '../styles/AnalyticsCharts.css';

/**
 * Line Chart Component for displaying trends over time
 */
const LineChart = ({ data, title, height = 300 }) => {
    if (!data || data.length === 0) {
        return <div className="line-chart-empty">No data available</div>;
    }

    const maxValue = Math.max(...data.map(d => Math.max(d.approved || 0, d.declined || 0, d.pending || 0, d.total || 0)));
    const chartHeight = height - 60; // Reserve space for labels

    const getY = (value) => {
        if (maxValue === 0) return chartHeight;
        return chartHeight - (value / maxValue) * chartHeight;
    };

    const getX = (index) => {
        const width = 100 / (data.length - 1 || 1);
        return index * width;
    };

    const createPath = (dataKey, color) => {
        const points = data.map((d, i) => `${getX(i)},${getY(d[dataKey] || 0)}`).join(' ');
        return (
            <polyline
                key={dataKey}
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                className="line-chart-line"
            />
        );
    };

    const colors = {
        total: '#3b82f6',
        approved: '#10b981',
        declined: '#ef4444',
        pending: '#8b5cf6',
        days: '#f59e0b'
    };

    return (
        <div className="line-chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <svg className="line-chart" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <line
                        key={i}
                        x1="0"
                        y1={chartHeight * ratio}
                        x2="100"
                        y2={chartHeight * ratio}
                        stroke="#e5e7eb"
                        strokeWidth="0.2"
                    />
                ))}

                {/* Data lines */}
                {Object.keys(colors).map(key => {
                    if (data.some(d => d[key] !== undefined)) {
                        return createPath(key, colors[key]);
                    }
                    return null;
                })}

                {/* Data points */}
                {data.map((d, i) => (
                    <g key={i}>
                        {Object.keys(colors).map(key => {
                            if (d[key] !== undefined) {
                                return (
                                    <circle
                                        key={key}
                                        cx={getX(i)}
                                        cy={getY(d[key])}
                                        r="1"
                                        fill={colors[key]}
                                        className="line-chart-point"
                                    />
                                );
                            }
                            return null;
                        })}
                    </g>
                ))}
            </svg>

            {/* X-axis labels */}
            <div className="line-chart-labels">
                {data.map((d, i) => (
                    <div key={i} className="line-chart-label">
                        {d.monthName || d.label}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="chart-legend">
                {Object.entries(colors).map(([key, color]) => {
                    if (data.some(d => d[key] !== undefined)) {
                        return (
                            <div key={key} className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: color }}></span>
                                <span className="legend-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

LineChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            monthName: PropTypes.string,
            total: PropTypes.number,
            approved: PropTypes.number,
            declined: PropTypes.number,
            pending: PropTypes.number,
            days: PropTypes.number
        })
    ).isRequired,
    title: PropTypes.string,
    height: PropTypes.number
};

export default LineChart;
