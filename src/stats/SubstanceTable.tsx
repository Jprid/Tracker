import {Component, JSX} from "react";
import type {SubstanceEntry, SubstanceTableProps, SubstanceTableState} from "../interfaces.ts";

class SubstanceTable extends Component<SubstanceTableProps, SubstanceTableState> {

    constructor(props: SubstanceTableProps) {
        super(props);
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

    render(): JSX.Element {
        return (
            <div className="pd-lg h-full w-full">
                <h3 className="text-lg font-semibold mb-4">Substance Log</h3>

                {/* Table */}
                <div className="d-flex h-70 flex-row justify-content-center">
                    <table className="stats-table w-full border-gray-300">
                        <thead className="stats-table-header">
                        <tr>
                            <th scope="col" className="">Time</th>
                            <th scope="col" className="">Substance</th>
                            <th scope="col" className="">Dose</th>
                            <th scope="col" className="">Notes</th>
                            <th scope="col" className="">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.entries.map((row: SubstanceEntry) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="">{row.time}</td>
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

export {SubstanceTable};