import PropTypes from 'prop-types';
import '../styles/AnalyticsCharts.css';

/**
 * Stats Card Component for displaying key metrics
 */
const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => {
    const colorClasses = {
        blue: 'stats-card-blue',
        green: 'stats-card-green',
        red: 'stats-card-red',
        purple: 'stats-card-purple',
        orange: 'stats-card-orange',
        gray: 'stats-card-gray'
    };

    return (
        <div className={`stats-card ${colorClasses[color]}`}>
            <div className="stats-card-header">
                {Icon && <Icon className="stats-card-icon" />}
                <h3 className="stats-card-title">{title}</h3>
            </div>
            <div className="stats-card-value">{value}</div>
            {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
            {trend && (
                <div className={`stats-card-trend ${trend.direction}`}>
                    {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                </div>
            )}
        </div>
    );
};

StatsCard.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string,
    color: PropTypes.oneOf(['blue', 'green', 'red', 'purple', 'orange', 'gray']),
    trend: PropTypes.shape({
        direction: PropTypes.oneOf(['up', 'down']).isRequired,
        value: PropTypes.string.isRequired
    })
};

export default StatsCard;
