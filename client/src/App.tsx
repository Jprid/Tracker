import './App.css'
import {createRef, Component, type JSX, type RefObject} from 'react';
import {StatsComponent} from "./stats/Stats";
import type {DayTotals, SubstanceEntry} from "./interfaces.ts";
import {Table} from "./stats/Table.tsx";
import {EntryTerminal} from "./EntryTerminal/EntryTerminal";
import {getEntries, addEntry, getDayTotals} from './Services/habitService';

interface AppState {
    entries: SubstanceEntry[];
    dayTotals: DayTotals[];
}
class App extends Component<object, AppState> {
    private statsRef: RefObject<StatsComponent | null>;
    constructor(props: object) {
        super(props);
        this.save = this.save.bind(this);
        this.clear = this.clear.bind(this);
        this.statsRef = createRef<StatsComponent>();
        this.state = {
            entries:  [],
            dayTotals: []
        };
    }

    async componentDidMount() {
        try {
            const date = new Date().toLocaleDateString().replaceAll('/', '-');
            const entries = await getEntries(date, import.meta.env.VITE_ACCESS_TOKEN);
            const dayTotals = await getDayTotals();
            this.setState({entries, dayTotals});
        } catch (error) {
            console.error(error);
        }
    }

    // This method will be passed to the table and will trigger stats updates
    private handleTableDataChange = (data: SubstanceEntry[]): void => {
        if (this.statsRef.current) {
            this.statsRef.current.handleDataChange(data);
        } else {
            console.warn('Stats component not mounted yet');
        }
    }

    private addEntry = async (entry: Omit<SubstanceEntry, 'id'>): Promise<void> => {
        try {
            const response = await addEntry(entry, import.meta.env.VITE_ACCESS_TOKEN);
            if (!response.ok) {
                console.error('API Failed to add entry:', response.statusText);
                return;
            }
            const date = new Date().toLocaleDateString().replaceAll('/', '-');
            const entries = await getEntries(date, import.meta.env.VITE_ACCESS_TOKEN);
            const dayTotals = await getDayTotals();
            this.setState({entries, dayTotals});
            this.handleTableDataChange(entries);
        } catch (error) {
            console.error('Error adding entry:', error);
        }
    }

    private clear(): void {
    }

    private save(medium: string) {
        return;
    }

    render(): JSX.Element {
        return (
            <div className="page-container d-flex justify-content-center align-items-center flex-column w-full h-full">
                <h1 className="text-2xl font-bold">Tracker</h1>
                <div className="w-full d-flex flex-row w-full h-full">
                    <StatsComponent entries={this.state.entries} dayTotals={this.state.dayTotals} ref={this.statsRef} />
                    <Table entries={this.state.entries} onDataChange={this.handleTableDataChange} />
                </div>
                <EntryTerminal entries={this.state.entries} onClear={this.clear} onAdd={this.addEntry} onSave={this.save}/>
            </div>
        );
    }
}

export default App
