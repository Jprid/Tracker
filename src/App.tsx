import './App.css'
import {createRef, Component, type JSX, type RefObject} from 'react';
import {StatsComponent, SubstanceTable, EntryTerminal} from "./stats/Stats";
import type {SubstanceEntry} from "./interfaces.ts";

class EntryStore {
    private entries: SubstanceEntry[] = [];
    private listeners: (() => void)[] = [];

    public getEntries(): SubstanceEntry[] {
        return [...this.entries];
    }

    public addEntry(entry: Omit<SubstanceEntry, 'id'>): SubstanceEntry {
        const newEntry: SubstanceEntry = {
            ...entry,
            id: Math.random().toString(36).substr(2, 9)
        };
        this.entries.push(newEntry);
        this.notifyListeners();
        return newEntry;
    }

    public deleteEntry(id: string): SubstanceEntry | null {
        const index = this.entries.findIndex(e => e.id === id);
        if (index === -1) return null;

        const deletedEntry = this.entries[index];
        this.entries.splice(index, 1);
        this.notifyListeners();
        return deletedEntry;
    }

    public findEntry(id: string): SubstanceEntry | undefined {
        return this.entries.find(e => e.id === id);
    }

    public getEntryCount(): number {
        return this.entries.length;
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }
}

interface AppState {
    entries: SubstanceEntry[];
}
class App extends Component<object, AppState> {
    private statsRef: RefObject<StatsComponent | null>;
    constructor(props: object) {
        super(props);
        this.statsRef = createRef<StatsComponent>();
        this.state = {
            entries: [],
        };
    }

    // This method will be passed to the table and will trigger stats updates
    private handleTableDataChange = (data: SubstanceEntry[]): void => {
        if (this.statsRef.current) {
            this.statsRef.current.handleDataChange(data);
        }
    }

    private addEntry = (entry: Omit<SubstanceEntry, 'id'>): void => {
        const newEntry: SubstanceEntry = {
            ...entry,
            id: Math.random().toString(36).substring(2, 9)
        };

        this.setState(prevState => ({
            entries: [...prevState.entries, newEntry],
            notifications: [...prevState.notifications, `Added: ${newEntry.substance} ${newEntry.dose}mg`]
        }));
    };

    private saveToDisk() {

    }

    private save(medium: string) {
        const mediums = new Map([
            ['disk', () => this.saveToDisk()],
            ['browser', () => this.saveToBrowser()]
        ]);
    }

    render(): JSX.Element {
        return (
            <div className="page-container d-flex justify-content-center align-items-center flex-column w-full h-full">
                <h1 className="text-2xl font-bold">Substance Tracker Dashboard</h1>
                <div className="w-full d-flex flex-row w-full h-full">
                    <StatsComponent  ref={this.statsRef} />
                    <SubstanceTable onDataChange={this.handleTableDataChange} />
                </div>
                <EntryTerminal entries={this.state.entries} onAdd={this.addEntry}/>
            </div>
        );
    }
}

export default App
