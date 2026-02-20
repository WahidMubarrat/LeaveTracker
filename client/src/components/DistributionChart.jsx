import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import PropTypes from 'prop-types';

ChartJS.register(ArcElement, Tooltip, Legend);

const DistributionChart = ({ data, title }) => {
    const chartData = {
        labels: ['Annual Leave', 'Casual Leave', 'Others'],
        datasets: [
            {
                data: [
                    data.annual || 0,
                    data.casual || 0,
                    data.others || 0
                ].some(val => val > 0) ? [
                    data.annual || 0,
                    data.casual || 0,
                    data.others || 0
                ] : [0, 0, 1], // Default state
                backgroundColor: [
                    '#3b82f6', // Annual - Blue
                    '#10b981', // Casual - Green
                    '#f59e0b'  // Others - Orange
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 11,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '70%', // Makes it a Doughnut
    };

    return (
        <div className="chart-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div style={{ flex: 1, position: 'relative' }}>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

DistributionChart.propTypes = {
    data: PropTypes.shape({
        annual: PropTypes.number,
        casual: PropTypes.number,
        others: PropTypes.number,
    }).isRequired,
    title: PropTypes.string,
};

export default DistributionChart;
