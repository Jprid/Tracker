import React, { memo } from 'react';
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import type {PivotTableProps} from "../../types/interfaces.ts";
import './BarChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const BarChart: React.FC<PivotTableProps> = ({ 
    data, 
    label = 'Total', 
    backgroundColor = 'black', 
    borderColor = 'black',
    xAxisFontSize = 12,
    yAxisFontSize = 12,
    xAxisFontFamily = 'VCR Mono',
    yAxisFontFamily = 'VCR Mono',
    gridColor = 'rgba(0, 0, 0, 0.1)',
    xAxisFontColor = 'black',
    yAxisFontColor = 'black'
}) => {
    if (data.length === 0) {
        return <div>No data available for the selected period.</div>;
    }
    const labels = data.map(point => point.day.toString());
    const totals = data.map(point => point.total);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: 'white',
                titleColor: 'black',
                bodyColor: 'black',
                borderColor: 'black',
                borderWidth: 1,
                font: { family: 'VCR Mono Bold', size: 14 },
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: xAxisFontColor, font: { size: xAxisFontSize, family: xAxisFontFamily } },
            },
            y: {
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: yAxisFontColor, font: { size: yAxisFontSize, family: yAxisFontFamily }, beginAtZero: true },
            },
        },
        elements: {
            bar: { borderRadius: 0, borderSkipped: false },
        },
    };

    const chartData = {
        labels,
        datasets: [
            {
                label,
                data: totals,
                backgroundColor,
                borderColor,
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="bar-chart-container">
            <Bar data={chartData} options={options}/>
        </div>
    );
};

export default memo(BarChart);