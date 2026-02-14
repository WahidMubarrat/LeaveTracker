import PropTypes from 'prop-types';
import '../styles/AnalyticsCharts.css';

/**
 * Bar Chart Component for displaying leave statistics
 */
const BarChart = ({ data, maxValue, title, showLegend = true }) => {
    const colors = {
        approved: '#10b981',
        declined: '#ef4444',
        pending: '#8b5cf6',
        total: '#3b82f6',
        days: '#f59e0b'
    };

    return (
        <div className="bar-chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <div className="bar-chart">
                {data.map((item, index) => (
                    <div key={index} className="bar-chart-item">
                        <div className="bar-chart-label">{item.label}</div>
                        <div className="bar-chart-bars">
                            {item.values.map((value, idx) => (
                                <div key={idx} className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{
                                            width: `${(value.count / maxValue) * 100}%`,
                                            backgroundColor: colors[value.type] || '#6b7280',
                                            minWidth: value.count > 0 ? '20px' : '0'
                                        }}
                                        title={`${value.type}: ${value.count}`}
                                    >
                                        {value.count > 0 && (
                                            <span className="bar-value">{value.count}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {showLegend && (
                <div className="chart-legend">
                    {Object.entries(colors).map(([key, color]) => (
                        <div key={key} className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: color }}></span>
                            <span className="legend-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

BarChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            values: PropTypes.arrayOf(
                PropTypes.shape({
                    type: PropTypes.string.isRequired,
                    count: PropTypes.number.isRequired
                })
            ).isRequired
        })
    ).isRequired,
    maxValue: PropTypes.number.isRequired,
    title: PropTypes.string,
    showLegend: PropTypes.bool
};

export default BarChart;
