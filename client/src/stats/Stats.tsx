// Sample data for demonstration
import {Component, type JSX} from "react";
import type {
    StatsComponentProps,
    StatsComponentState,
    SubstanceEntry,
    SubstanceStats,
} from "../interfaces.ts";

/*
 *  StatsComponent
 */
class StatsComponent extends Component<StatsComponentProps, StatsComponentState> {
    constructor(props: StatsComponentProps) {
        super(props);
        this.state = {
            substanceStats: this.buildStatsData(props.entries)
        };
    }

    // This method will be called when the table emits data changes
    public handleDataChange = (data: SubstanceEntry[]): void => {
        console.log('stats component received data change');
        console.debug(data);
        const stats = this.buildStatsData(data);

        this.setState({ substanceStats: stats });
    }



    private buildStatsData(data: SubstanceEntry[]) {
        const stats: { [key: string]: SubstanceStats } = {};
        data.forEach((entry: SubstanceEntry) => {
            const {substance, dose} = entry;
            const key = substance.toLowerCase();
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

    private calculateAverage(totalDose: number, count: number): string {
        return (totalDose / count).toFixed(1);
    }

    render(): JSX.Element {
        const { substanceStats } = this.state;
        const substances: string[] = Object.keys(substanceStats);

        function renderFooter() {
            return <>
                {substances.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                            Total substances tracked: {substances.length}
                        </div>
                    </div>
                )}
            </>;
        }

        return (
            <div className="p-4 w-30 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold mb-4">Substance Statistics</h3>

                {substances.length === 0 ? (
                    <p className="text-gray-500">No data to display</p>
                ) : (
                    <div className="d-flex flex-column h-full">
                        {substances.map((substance: string) => {
                            const stats = substanceStats[substance];
                            return (
                                <div key={substance} className="card bg-white mg-sm border">
                                    <span className="card-header font-medium text-gray-700">{substance.charAt(0).toUpperCase() + substance.slice(1)}</span>
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