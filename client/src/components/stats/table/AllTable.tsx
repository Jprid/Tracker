import {type JSX, type MouseEvent} from "react";
import type {Entry, MedicineEntry} from "../../../types/interfaces.ts";
import { EditableAllRow } from "./EditableAllRow.tsx";

interface AllTableProps {
    entries: Entry[];
    medicineEntries: MedicineEntry[];
    editingId: number | null;
    onContextMenu: (event: MouseEvent<HTMLTableCellElement>, entry: Entry | MedicineEntry) => void;
    onSave: (entry: Entry | MedicineEntry) => void;
    onCancel: () => void;
}

function AllTable({ entries, medicineEntries, editingId, onContextMenu, onSave, onCancel }: AllTableProps): JSX.Element {
    // Combine and sort all entries by time (newest first)
    const allEntries = [
        ...entries.map(entry => ({ ...entry, type: 'entry' as const })),
        ...medicineEntries.map(entry => ({ ...entry, type: 'medicine' as const }))
    ].sort((a, b) => new Date(a.created_at + 'Z').getTime() - new Date(b.created_at + 'Z').getTime());

    const headers = (
        <>
            <th scope="col" className="table-column">Time</th>
            <th scope="col" className="table-column">Details</th>
            <th scope="col" className="table-column">Status/Dose</th>
            <th scope="col" className="table-column">Type</th>
        </>
    );

    const content = (
        <>
            {allEntries.map((entry) => (
                <EditableAllRow
                    key={`${entry.type}-${entry.id}`}
                    entry={entry}
                    isEditing={editingId === entry.id}
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

export { AllTable };
