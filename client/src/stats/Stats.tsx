// Sample data for demonstration
import {Component, type JSX} from "react";
import type {
    DataPoint,
    StatsComponentProps,
    StatsComponentState,
    SubstanceEntry,
    SubstanceStats,
} from "../interfaces.ts";
import BarChart from "../Charts/BarChart.tsx";

/*
 *  StatsComponent
 */
class StatsComponent extends Component<StatsComponentProps, StatsComponentState> {
    constructor(props: StatsComponentProps) {
        super(props);
        this.state = {
            stats: this.buildStatsData(props.entries),
            dayTotals: props.dayTotals
        };
    }

    componentDidMount() {
        this.handleDataChange(this.props.entries);
    }

    componentDidUpdate(prevProps: StatsComponentProps) {
        if (prevProps.entries !== this.props.entries) {
            this.handleDataChange(this.props.entries);
        }
        if (prevProps.dayTotals !== this.props.dayTotals) {
            this.setState({dayTotals: this.props.dayTotals});
        }
    }

    // This method will be called when the table emits data changes
    public handleDataChange = (data: SubstanceEntry[]) => {
        const stats = this.buildStatsData(data);
        this.setState({stats, dayTotals: this.props.dayTotals || []});
    }

    private buildStatsData(data: SubstanceEntry[]) {
        const stats: { [key: string]: SubstanceStats } = {};
        data.forEach((entry: SubstanceEntry) => {
            if (!entry) return;
            const {name, dose} = entry;
            console.log(entry, name, dose);
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
        });
        return stats;
    }

    private calculateAverage(total: number, count: number): string {
        return (total / count).toFixed(1);
    }

    render(): JSX.Element {
        const {stats, dayTotals} = this.state;
        console.debug("DAYTOTALS");
        console.debug(dayTotals);
        const keys: string[] = Object.keys(stats);

        function renderFooter() {
            return (
                <div className="mt-4 pt-3 border-t">
                    <div className="text-sm text-gray-600">
                        Total entry types tracked: {keys.length}
                    </div>
                    <BarChart data={dayTotals}/>
                </div>
            );
        }

        const utcDate = new Date().toISOString();
        const date = new Date().toLocaleTimeString('en-us', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        return (
            <div className="stats-container rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="d-flex flex-column date-display">
                    <div className="utc-day">${utcDate}</div>
                    <div className="utc-day">${date}</div>
                </div>
                {keys.length === 0 ? (
                    <p className="text-gray-500">No data to display</p>
                ) : (
                    <div className="d-flex flex-column ">
                        {keys.map((substance: string) => {
                            const stats = this.state.stats[substance];
                            return (
                                <>
                                    <div key={substance} className="card bg-white mg-sm border">
                                        <span
                                            className="card-header font-medium text-gray-700">{substance.charAt(0).toUpperCase() + substance.slice(1)}</span>
                                        <div className="card-subheader text-lg font-bold text-blue-600">
                                            {stats.totalDose} mg
                                        </div>
                                        <div className="card-body text-sm text-gray-500">
                                            {stats.count} {stats.count === 1 ? 'entry' : 'entries'}
                                        </div>
                                        <div className="card-footer border-top mt-sm text-sm text-gray-600">
                                            Avg per entry: {this.calculateAverage(stats.totalDose, stats.count)}
                                        </div>
                                    </div>
                                </>
                            );
                        })}
                    </div>
                )}

                {renderFooter()}
            </div>
        );
    }
}

export {StatsComponent};