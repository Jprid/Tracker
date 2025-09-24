import {type JSX, type MouseEvent} from "react";
import type {Entry} from "../../../types/interfaces.ts";
import { EditableEntryRow } from "./EditableEntryRow.tsx";

interface EntryTableProps {
    entries: Entry[];
    editingId: number | null;
    onContextMenu: (event: MouseEvent<HTMLTableCellElement>, entry: Entry) => void;
    onSave: (entry: Entry) => void;
    onCancel: () => void;
}

function EntryTable({ entries, editingId, onContextMenu, onSave, onCancel }: EntryTableProps): JSX.Element {
    const headers = (
        <>
            <th scope="col" className="table-column">Time</th>
            <th scope="col" className="table-column">Entry</th>
            <th scope="col" className="table-column">Complete</th>
            <th scope="col" className="table-column"></th>
        </>
    );

    const content = (
        <>
            {entries.map((row: Entry) => (
                <EditableEntryRow
                    key={row.id}
                    entry={row}
                    isEditing={editingId === row.id}
                    onContextMenu={onContextMenu}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            ))}
        </>
    );

    return (
        <div className="table-container d-flex flex-column">
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

export { EntryTable };
