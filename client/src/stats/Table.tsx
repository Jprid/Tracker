import {Component, type JSX} from "react";
import type {SubstanceEntry, SubstanceTableProps, SubstanceTableState} from "../interfaces.ts";

class Table extends Component<SubstanceTableProps, SubstanceTableState & { selectedTab: 'entry' | 'medicine' }> {

    constructor(props: SubstanceTableProps) {
        super(props);
        this.state = {
        };
    }

    componentDidMount(): void {
        // Emit initial data to stats component
        this.props.onDataChange(this.props.entries);
        this.props.onTabChange?.(this.props.selectedTab!);
    }

    render(): JSX.Element {
        return (<>
            <div className="h-full w-full d-flex flex-column justify-content-center">
                {/* Tabs */}
                <div className="tabs mb-4 d-flex flex-row">
                    {this.renderButton('entry')}
                    <button
                        className={`tab tab-btn-${this.props.selectedTab === 'medicine' ? 'active' : ''}`}
                        onClick={() => this.onTabChange('medicine')}
                    >Medicine Log
                    </button>
                </div>
                {/* Table */}
                {this.renderTable(this.props.selectedTab!)}
            </div>
        </>);
    }

    private renderButton(entry: "entry" | "medicine" | undefined) {
        return <button
            className={`tab tab-btn-${this.props.selectedTab === entry ? 'active' : ''}`}
            onClick={() => this.onTabChange(entry)}
        >Entry Log
        </button>;
    }

    private renderTableContainer(headers: JSX.Element, content: JSX.Element) {
        return (
            <div className="table-container d-flex flex-column justify-content-center">
                <table className="stats-table">
                    <thead className="stats-table-header">
                        <tr>
                            {headers}
                        </tr>
                    </thead>
                    <tbody>
                        {content}
                    </tbody>
                </table>
            </div>
        );
    }

    private renderTable(selectedTab: "entry" | "medicine") {
        if (selectedTab === 'entry') {
            const headers = (
                <>
                    <th scope="col">Time</th>
                    <th scope="col">Entry</th>
                    <th scope="col">Complete</th>
                </>
            );
            const content = (
                <tr>
                    <td>9AM</td>
                    <td>Start work</td>
                    <td className="h-full w-full d-flex flex-row justify-content-center align-items-center">
                        <div className="checkbox"></div>
                    </td>
                </tr>
            );
            return this.renderTableContainer(headers, content);
        }
        if (selectedTab === 'medicine') {
            const headers = (
                <>
                    <th scope="col">Time</th>
                    <th scope="col">Name</th>
                    <th scope="col">Dose</th>
                </>
            );
            const content = (
                <>
                    {this.props.entries.map((row: SubstanceEntry) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            <td>{row.time}</td>
                            <td>{row.name}</td>
                            <td>{row.dose}</td>
                        </tr>
                    ))}
                </>
            );
            return this.renderTableContainer(headers, content);
        }
        return null;
    }

    private onTabChange(tab: 'entry' | 'medicine') {
       this.setState({selectedTab: tab as 'entry' | 'medicine'});
       this.props.onTabChange?.(tab);
    }
}

export {Table};