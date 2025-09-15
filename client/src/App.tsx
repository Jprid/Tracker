import './App.css'
import {createRef, Component, type JSX, type RefObject} from 'react';
import {StatsComponent} from "./stats/Stats";
import type {DayTotals, SubstanceEntry} from "./interfaces.ts";
import {Table} from "./stats/Table.tsx";
import {EntryTerminal} from "./EntryTerminal/EntryTerminal";
import {getEntries, addEntry, getDayTotals} from './Services/habitService';
import { BrowserRouter } from 'react-router-dom';

interface AppState {
    entries: SubstanceEntry[];
    dayTotals: DayTotals[];
    selectedTab: 'entry' | 'medicine';
}

function getTabFromQuery(search: string): 'entry' | 'medicine' {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');
    console.log(tab);
    return tab as 'entry' | 'medicine';
}

class App extends Component<object, AppState> {
    private statsRef: RefObject<StatsComponent | null>;
    constructor(props: object) {
        super(props);
        this.save = this.save.bind(this);
        this.clear = this.clear.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.statsRef = createRef<StatsComponent>();
        this.state = {
            entries:  [],
            dayTotals: [],
            selectedTab: getTabFromQuery(window.location.search) || 'entry',
        };
    }

    async componentDidMount() {
        try {
            const date = new Date().toLocaleDateString().replaceAll('/', '-');
            const entries = await getEntries(date, import.meta.env.VITE_ACCESS_TOKEN);
            const dayTotals = await getDayTotals();
            const tab = getTabFromQuery(window.location.search);
            this.setState({entries, dayTotals, selectedTab: tab});
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

    private handleTabChange(tab: 'entry' | 'medicine'): void {
        console.log('Tab changed to:', tab);
        this.setState({selectedTab: tab});
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }

    render(): JSX.Element {
        return (
            <BrowserRouter>
                <div className="page-container d-flex justify-content-center align-items-center flex-column w-full h-full">
                    <h1 className="text-2xl font-bold">Tracker</h1>
                    <div className="w-full d-flex flex-row h-full">
                        <StatsComponent entries={this.state.entries} dayTotals={this.state.dayTotals} ref={this.statsRef} />
                        <Table
                            entries={this.state.entries}
                            onDataChange={this.handleTableDataChange}
                            selectedTab={this.state.selectedTab}
                            onTabChange={this.handleTabChange}
                        />
                    </div>
                    <EntryTerminal entries={this.state.entries} onClear={this.clear} onAdd={this.addEntry} onSave={this.save}/>
                </div>
            </BrowserRouter>
        );
    }
}

export default App
