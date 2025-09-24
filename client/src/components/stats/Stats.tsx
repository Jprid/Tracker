import {useState, useEffect, useCallback, useMemo, memo, type JSX} from "react";
import type {
    DataPoint,
    StatsComponentProps,
    MedicineEntry,
    SubstanceStats,
    Entry
} from "../../types/interfaces.ts";
import BarChart from "../../components/charts/BarChart.tsx";
import { getUniqueSubstances, request } from "../../services/ApiClient.ts";
import { useAuth } from "../../contexts/AuthContext.tsx";
import './Stats.css';
import { transformEntriesToDataPoints } from "../../utils/transforms.ts";

function StatsComponent(props: StatsComponentProps): JSX.Element {
    const [stats, setStats] = useState<{ [key: string]: SubstanceStats }>({});
    const [dayTotals, setDayTotals] = useState<DataPoint[]>([]);
    const [uniqueSubstances, setUniqueSubstances] = useState<string[]>([]);
    const [selectedSubstance, setSelectedSubstance] = useState<string | null>(null);
    const [entryStats, setEntryStats] = useState<{ tasksToday: number }>({ tasksToday: 0 });
    const {accessToken, setAccessToken} = useAuth();

    const buildStatsData = useCallback((data: MedicineEntry[] | Entry[]) => {
        const stats: { [key: string]: SubstanceStats } = {};
        data.forEach((entry: MedicineEntry | Entry) => {
            if (!entry) return;
            if ('name' in entry && 'dose' in entry) {
                const {name, dose} = entry;
                if (!name || !dose) return;
                const key = name.toLowerCase();
                if (key in stats) {
                    stats[key].totalDose += dose;
                    stats[key].count += 1;
                    stats[key].frequency += 1;
                } else {
                    stats[key] = {
                        totalDose: dose,
                        count: 1,
                        frequency: 1
                    };
                }
            }
        });
        return stats;
    }, []);

    const buildEntryStatsData = useCallback((data: Entry[]) => {
        return { tasksToday: data.length };
    }, []);

    const calculateAverage = useCallback((total: number, count: number): string => {
        return (total / count).toFixed(1);
    }, []);

    const handleDataChange = useCallback((data: MedicineEntry[] | Entry[] | (MedicineEntry | Entry)[]) => {
        if (props.selectedTab === 'medicine') {
            const newStats = buildStatsData(data as MedicineEntry[]);
            setStats(newStats);
        } else if (props.selectedTab === 'entry' || props.selectedTab === 'all') {
            const entryData = data.filter((entry): entry is Entry => 'text' in entry) as Entry[];
            const newEntryStats = buildEntryStatsData(entryData);
            setEntryStats(newEntryStats);
        }
        setDayTotals(props.dayTotals || []);
    }, [buildStatsData, buildEntryStatsData, props.dayTotals, props.selectedTab]);

    useEffect(() => {
        handleDataChange(props.entries);
    }, [handleDataChange, props.entries]);

    useEffect(() => {
        setDayTotals(props.dayTotals || []);
    }, [props.dayTotals]);

    useEffect(() => {
        const fetchUniqueSubstances = async () => {
            try {
                const substances = await getUniqueSubstances(accessToken, setAccessToken);
                setUniqueSubstances(substances);
                // Auto-select the first substance to show chart by default
                if (substances.length > 0 && !selectedSubstance) {
                    setSelectedSubstance(substances[0]);
                }
            } catch (error) {
                console.error('Failed to fetch unique substances:', error);
            }
        };
        fetchUniqueSubstances();
    }, [accessToken, setAccessToken, selectedSubstance]);

    useEffect(() => {
        const fetchSubstanceChartData = async (substance: string) => {
            try {
                const response = await request(`${import.meta.env.VITE_API_BASE_URL}/medicine/${substance.toLowerCase()}/pivot`, {
                    method: 'GET',
                }, accessToken, setAccessToken);
                if (!response.ok) {
                    throw new Error('Failed to fetch substance chart data');
                }
                const data = await response.json();
                // Check if data.entries is already in DataPoint format (fake data) or needs transformation
                let chartData: DataPoint[];
                if (data.entries && data.entries.length > 0 && 'day' in data.entries[0] && typeof data.entries[0].day === 'number') {
                    // Already in correct format (fake data)
                    chartData = data.entries;
                } else {
                    // Needs transformation (real API data)
                    chartData = transformEntriesToDataPoints(data.entries);
                }
                setDayTotals(chartData);
            } catch (error) {
                console.error('Failed to fetch substance chart data:', error);
                setDayTotals([]);
            }
        };

        if (selectedSubstance) {
            fetchSubstanceChartData(selectedSubstance);
        }
    }, [selectedSubstance, accessToken, setAccessToken]);

    const keys: string[] = useMemo(() => Object.keys(stats), [stats]);

    function renderFooter() {
        return (
            <div className="stats-footer">
                <div>
                    {props.selectedTab === 'medicine'
                        ? `Total substances tracked: ${keys.length}`
                        : `Total entries: ${(props.entries as Entry[]).length}`
                    }
                </div>
                {/* Substance-specific chart */}
                {props.selectedTab === 'medicine' && ((selectedSubstance && dayTotals.length > 0) || (!selectedSubstance && (props.dayTotals || []).length > 0)) && (
                    <div className="chart-section">
                        <div className="chart-header">
                            <h4 className="chart-title">
                                {selectedSubstance ? `${selectedSubstance} Chart` : 'Chart'}
                            </h4>
                            <div className="chart-controls">
                                <label className="chart-label">Select Substance:</label>
                                <div className="chart-buttons">
                                    {uniqueSubstances.map((substance) => (
                                        <button
                                            key={substance}
                                            onClick={() => setSelectedSubstance(substance)}
                                            className={`chart-button ${
                                                selectedSubstance === substance ? 'active' : ''
                                            }`}
                                        >
                                            {substance.charAt(0).toUpperCase() + substance.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <BarChart data={selectedSubstance ? dayTotals : (props.dayTotals || [])}/>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="stats-container">
            <div className="stats-controls">
                <h3 className="">
                    {props.selectedTab === 'medicine' ? 'Medicine Statistics' : 
                    props.selectedTab === 'all' ? 'All Entries Statistics' : 'Entry Statistics'}
                </h3>
            </div>
                {props.selectedTab === 'medicine' ? (
                    keys.length === 0 ? (
                                            <div className="empty-state py-8 px-4">
                            <div className="mb-4">
                                <div className="mb-2">📊</div>
                                <h4 className="mb-2">No Statistics Yet</h4>
                                <p className="mb-4">
                                    Start tracking your medicine usage to see detailed statistics and insights here.
                                </p>
                            </div>
                            <div className="text-gray-400">
                                <p>Add your first entry to begin</p>
                                <p>🎯 Monitor your progress and patterns</p>
                            </div>
                        </div>
                    ) : (
                        <div className="entry-stats-table-container">
                            <table className="entry-stats-table medicine-stats-table">
                                <thead>
                                    <tr>
                                        <th>Substance</th>
                                        <th>Total Dose</th>
                                        <th>Entries</th>
                                        <th>Avg per Entry</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((substance: string) => {
                                        const substanceStats = stats[substance];
                                        return (
                                            <tr key={substance}>
                                                <td className="metric-value">{substance.charAt(0).toUpperCase() + substance.slice(1)}</td>
                                                <td>{substanceStats.totalDose} mg</td>
                                                <td>{substanceStats.count} {substanceStats.count === 1 ? 'entry' : 'entries'}</td>
                                                <td>{calculateAverage(substanceStats.totalDose, substanceStats.count)} mg</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="entry-stats-table-container">
                        <table className="entry-stats-table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Tasks Created</td>
                                    <td className="metric-value">{entryStats.tasksToday}</td>
                                    <td>{entryStats.tasksToday === 1 ? 'task' : 'tasks'} recorded</td>
                                </tr>
                                <tr>
                                    <td>Completion Rate</td>
                                    <td className="metric-value">
                                        {props.entries.length > 0 
                                            ? Math.round((props.entries.filter(e => 'completed' in e && e.completed).length / props.entries.length) * 100) 
                                            : 0}%
                                    </td>
                                    <td>
                                        {props.entries.filter(e => 'completed' in e && e.completed).length} of {props.entries.length} completed
                                    </td>
                                </tr>
                                <tr>
                                    <td>Status</td>
                                    <td className="metric-value">
                                        {entryStats.tasksToday > 0 ? 'Active' : 'No Data'}
                                    </td>
                                    <td>
                                        {entryStats.tasksToday > 0 
                                            ? 'Tracking in progress' 
                                            : 'Add entries to begin tracking'
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {renderFooter()}
        </div>
    );
}

const MemoizedStatsComponent = memo(StatsComponent);

export {MemoizedStatsComponent as StatsComponent};