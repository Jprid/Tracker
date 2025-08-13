// Sample data for demonstration
import {Component, JSX} from "react";
import type {SubstanceEntry, SubstanceTableProps, SubstanceTableState, StatsComponentProps, StatsComponentState, SubstanceStatsMap} from "../interfaces.ts";
const sampleData: SubstanceEntry[] = [
    { id: 1, time: '09:00', substance: 'Caffeine', dose: 60, notes: '' },
    { id: 2, time: '10:00', substance: 'Nicotine', dose: 6, notes: 'Evening supplement' }
];
interface EntryTerminalProps {
    onAdd: (entry: Omit<SubstanceEntry, 'id'>) => void;
    onClearHistory: () => void;
    entries: SubstanceEntry[];
}

class EntryTerminalConstants {
    public static addCommandUsageText: string = "add <substance> <dose>";
    public static timeTransform: () => string = () => new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
}

class EntryTerminal extends Component<EntryTerminalProps, object> {
    private commandInput: HTMLInputElement | null = null;

    private isAddCommand = (parts: string[]) =>
        parts[0].toLowerCase() === 'add' && parts.length >= 3;

    private isSaveCommand = (parts: string[]) => parts[0].toLowerCase() === 'save';

    private commands: string[] = [EntryTerminalConstants.addCommandUsageText];

    private handleSubmit = (): void => {
        if (this.commandInput?.value) {
            const input = this.commandInput.value.trim();
            const parts = input.split(/\s+/);


            if (this.isAddCommand(parts)) {
                this.addEntry(parts);
            } else if (this.isSaveCommand(parts)) {
                this.saveEntry();
            }
        }
    };

    private saveEntry() {
        localStorage.setItem("_HABIT_TRACKER_LOCAL_STORAGE_" + new Date().getUTCDate(), JSON.stringify(this.state));
    }

    private addEntry(parts: string[]) {
        const time = EntryTerminalConstants.timeTransform();
        const substance = parts[1];
        const dose = parseFloat(parts[2]);
        const notes = parts.slice(3).join(' ');
        if (!isNaN(dose)) {
            this.props.onAdd({time, substance, dose, notes});
            this.commandInput!.value = '';
        }
    }

    render(): JSX.Element {
        return (
            <div className="mb-4 w-full p-3 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Add Entry (Terminal)</h4>
                <div className="w-full">
                    {this.commands.map((cmd: string) => <p>{cmd}</p>)}
                </div>
                <div className="d-flex flex-row">
                    <input
                        // @ts-ignore
                        ref={(r) => (this.commandInput = r)}
                        placeholder="add substance dose notes..."
                        className="d-flex mg-sm pd-sm border flex-fill"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') this.handleSubmit();
                        }}
                    />
                </div>
            </div>
        );
    }

}
class SubstanceTable extends Component<SubstanceTableProps, SubstanceTableState> {
    private timeInput: HTMLInputElement | null = null;
    private substanceInput: HTMLInputElement | null = null;
    private doseInput: HTMLInputElement | null = null;
    private notesInput: HTMLInputElement | null = null;

    constructor(props: SubstanceTableProps) {
        super(props);
        this.state = {
            data: sampleData
        };
    }

    componentDidMount(): void {
        // Emit initial data to stats component
        this.props.onDataChange(this.state.data);
    }

    private addEntry = (entry: Omit<SubstanceEntry, 'id'>): void => {
        const maxId: number = this.state.data.length + 1;
        const newData: SubstanceEntry[] = [...this.state.data, { ...entry, id: maxId }];
        this.setState({ data: newData });
        // Emit event when data changes
        this.props.onDataChange(newData);
    }

    private deleteEntry = (id: number): void => {
        const newData: SubstanceEntry[] = this.state.data.filter(item => item.id !== id);
        this.setState({ data: newData });
        // Emit event when data changes
        this.props.onDataChange(newData);
    }

    render(): JSX.Element {
        return (
            <div className="pd-lg h-full w-full">
                <h3 className="text-lg font-semibold mb-4">Substance Log</h3>

                {/* Table */}
                <div className="d-flex h-70 flex-row justify-content-center">
                    <table className="stats-table w-full border-gray-300">
                        <thead className="stats-table-header">
                        <tr >
                            <th scope="col" className="">Time</th>
                            <th scope="col" className="">Substance</th>
                            <th scope="col" className="">Dose</th>
                            <th scope="col" className="">Notes</th>
                            <th scope="col" className="">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.data.map((row: SubstanceEntry) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="">{EntryTerminalConstants.timeTransform(row.time)}</td>
                                <td className="">{row.substance}</td>
                                <td className="">{row.dose}</td>
                                <td className="">{row.notes}</td>
                                <td className="">
                                    <button
                                        onClick={() => this.deleteEntry(row.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {/* Simple form to add new entries */}
            </div>
        );
    }
}

/*
 *  StatsComponent
 */
class StatsComponent extends Component<StatsComponentProps, StatsComponentState> {
    constructor(props: StatsComponentProps) {
        super(props);
        this.state = {
            substanceStats: {}
        };
    }

    // This method will be called when the table emits data changes
    public handleDataChange = (data: SubstanceEntry[]): void => {
        const stats: SubstanceStatsMap = {};

        data.forEach((entry: SubstanceEntry) => {
            const { substance, dose } = entry;
            if (stats[substance.toLowerCase()]) {
                stats[substance].totalDose += dose;
                stats[substance].count += 1;
            } else {
                stats[substance.toLowerCase()] = {
                    totalDose: dose,
                    count: 1
                };
            }
        });

        this.setState({ substanceStats: stats });
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
                    <div className="d-flex flex-column justify-content-space-evenly space-y-3 h-full">
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

export {StatsComponent, SubstanceTable, EntryTerminal};