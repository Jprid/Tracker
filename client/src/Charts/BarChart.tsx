import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DataPoint {
    day: number;
    total: number;
}

interface PivotTableProps {
    data: DataPoint[];
}

const BarChart: React.FC<PivotTableProps> = ({ data }) => {
    // Only use the last 10 data points
    const displayData = data.slice(-10);

    const labels = displayData.map(point => point.day.toString());
    const totals = displayData.map(point => point.total);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                cornerRadius: 4,
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#666666', font: { size: 12 } },
            },
            y: {
                grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false },
                ticks: { color: '#666666', font: { size: 12 }, beginAtZero: true },
            },
        },
        elements: {
            bar: { borderRadius: 2, borderSkipped: false },
        },
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Total',
                data: totals,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;