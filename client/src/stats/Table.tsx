import {Component, type JSX} from "react";
import type {SubstanceEntry, SubstanceTableProps, SubstanceTableState} from "../interfaces.ts";

class Table extends Component<SubstanceTableProps, SubstanceTableState & { selectedTab: 'entry' | 'medicine' }> {

    constructor(props: SubstanceTableProps) {
        super(props);
        this.state = {
            ...props,
            selectedTab: 'entry', // default tab
        };
    }

    componentDidMount(): void {
        // Emit initial data to stats component
        this.props.onDataChange(this.props.entries);
    }


    private deleteEntry = (id: number): void => {
        const newData: SubstanceEntry[] = this.state.data.filter(item => item.id !== id);
        this.setState({data: newData});
        // Emit event when data changes
        this.props.onDataChange(newData);
    }

    private handleTabChange = (tab: 'entry' | 'medicine') => {
        this.setState({ selectedTab: tab });
    }

    render(): JSX.Element {
        const { selectedTab } = this.state;
        return (<>
            <div className="h-full w-full d-flex flex-column justify-content-center">
                {/* Tabs */}
                <div className="tabs mb-4 d-flex flex-row">
                    <button
                        className={`tab tab-btn-${selectedTab === 'entry' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('entry')}
                    >Entry Log
                    </button>
                    <button
                        className={`tab tab-btn-${selectedTab === 'medicine' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('medicine')}
                    >Medicine Log
                    </button>
                </div>
                {/* Table */}
                {this.renderTable(selectedTab)}
            </div>
        </>);
    }

    private renderTableContainer(headers: JSX.Element, content: JSX.Element) {
        return (
            <div className="h-full w-full d-flex flex-column justify-content-center">
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
        return <>
            {selectedTab === 'entry' && (
                <div className="h-full w-full d-flex flex-column justify-content-center">
                    <table className="stats-table">
                        <thead className="stats-table-header">
                        <tr>
                            <th scope="col" className="">Time</th>
                            <th scope="col" className="">Entry</th>
                            <th scope="col" className="">Complete</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td scope="col">
                                9AM
                            </td>
                            <td>Start work</td>
                            <td scope="col" className="d-flex"><div className="checkbox"></div></td>

                        </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {selectedTab === 'medicine' && (
                <div className="d-flex h-full w-full flex-column justify-content-center">
                    <table className="stats-table border-gray-300">
                        <thead className="stats-table-header">
                        <tr>
                            <th scope="col" className="">Time</th>
                            <th scope="col" className="">Name</th>
                            <th scope="col" className="">Dose</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.entries.map((row: SubstanceEntry) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td scope="col" className="">{row.time}</td>
                                <td scope="col" className="">{row.entry_type}</td>
                                <td scope="col" className="">{row.dose}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>;
    }
}

export {Table};