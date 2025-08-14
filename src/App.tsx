import './App.css'
import {createRef, Component, type JSX, type RefObject} from 'react';
import {StatsComponent} from "./stats/Stats";
import type {SubstanceEntry} from "./interfaces.ts";
import {SubstanceTable} from "./stats/SubstanceTable.tsx";
import {EntryTerminal} from "./stats/EntryTerminal.tsx";

const sampleData: SubstanceEntry[] = [
    { id: 1, time: '09:00', substance: 'Caffeine', dose: 60, notes: '' },
    { id: 2, time: '10:00', substance: 'Nicotine', dose: 6, notes: 'Evening supplement' }
];
interface AppState {
    entries: SubstanceEntry[];
}
class App extends Component<object, AppState> {
    private statsRef: RefObject<StatsComponent | null>;
    constructor(props: object) {
        super(props);
        this.getStorageKey = this.getStorageKey.bind(this);
        this.save = this.save.bind(this);
        this.clear = this.clear.bind(this);
        const key = this.getStorageKey();
        let startingData: SubstanceEntry[] = sampleData;
        if (localStorage.getItem(key) != null) {
            startingData = JSON.parse(localStorage.getItem(key) as string);
        }
        this.statsRef = createRef<StatsComponent>();
        this.state = {
            entries: startingData,
        };
    }

    // This method will be passed to the table and will trigger stats updates
    private handleTableDataChange = (data: SubstanceEntry[]): void => {
        if (this.statsRef.current) {
            this.statsRef.current.handleDataChange(data);
        }
    }

    private addEntry = (entry: Omit<SubstanceEntry, 'id'>): void => {
        const maxId: number = this.state.entries.length - 1;
        const newEntry: SubstanceEntry = {
            ...entry,
            id: maxId + 1
        };

        this.setState(prevState => ({
            entries: [...prevState.entries, newEntry],
        }));
    };


    private getStorageKey(): string {
        return "_HABIT_TRACKER_LOCAL_STORAGE_" + new Date().getUTCMilliseconds().toString();
    }

    private clear(): void {
        localStorage.removeItem(this.getStorageKey());
        this.setState({entries: []});
    }

    private save(medium: string) {
        console.debug('Saving to ' + medium);
        if (medium === 'disk') {
            console.debug('not implemented');
        } else {
            const key = this.getStorageKey();
            console.log('storage key ' + key);
            localStorage.setItem(key, JSON.stringify([...this.state.entries]));
        }
    }

    render(): JSX.Element {
        return (
            <div className="page-container d-flex justify-content-center align-items-center flex-column w-full h-full">
                <h1 className="text-2xl font-bold">Substance Tracker Dashboard</h1>
                <div className="w-full d-flex flex-row w-full h-full">
                    <StatsComponent entries={this.state.entries} ref={this.statsRef} />
                    <SubstanceTable entries={this.state.entries} onDataChange={this.handleTableDataChange} />
                </div>
                <EntryTerminal entries={this.state.entries} onClear={this.clear} onAdd={this.addEntry} onSave={this.save}/>
            </div>
        );
    }
}

export default App
