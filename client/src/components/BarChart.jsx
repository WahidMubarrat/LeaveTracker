import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import '../styles/AnalyticsCharts.css';

// Register ChartJS modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Bar Chart Component for displaying leave statistics using Chart.js
 */
const BarChart = ({ data, title, showLegend = true }) => {
    const labels = data.map(item => item.label);

    // Extract unique types from data for datasets
    const types = ['approved', 'declined', 'pending'];
    const colors = {
        approved: '#10b981',
        declined: '#ef4444',
        pending: '#8b5cf6'
    };

    const datasets = types.map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        data: data.map(item => {
            const val = item.values.find(v => v.type === type);
            return val ? val.count : 0;
        }),
        backgroundColor: colors[type],
        borderRadius: 6,
        maxBarThickness: 30,
    }));

    const chartData = {
        labels,
        datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { size: 12 }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { size: 12 }
                },
                grid: {
                    color: '#f3f4f6'
                }
            }
        }
    };

    return (
        <div className="bar-chart-container" style={{ height: '400px' }}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                <Bar data={chartData} options={options} />
            </div>
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
    title: PropTypes.string,
    showLegend: PropTypes.bool
};

export default BarChart;
