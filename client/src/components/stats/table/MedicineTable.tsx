import {type JSX, type MouseEvent} from "react";
import type {MedicineEntry} from "../../../types/interfaces.ts";
import { EditableMedicineRow } from "./EditableMedicineRow.tsx";

interface MedicineTableProps {
    entries: MedicineEntry[];
    editingId: number | null;
    onContextMenu: (event: MouseEvent<HTMLTableCellElement>, entry: MedicineEntry) => void;
    onSave: (entry: MedicineEntry) => void;
    onCancel: () => void;
}

function MedicineTable({ entries, editingId, onContextMenu, onSave, onCancel }: MedicineTableProps): JSX.Element {
    const headers = (
        <>
            <th scope="col" className="table-column">Time</th>
            <th scope="col" className="table-column">Name</th>
            <th scope="col" className="table-column">Dose</th>
            <th scope="col" className="table-column"></th>
        </>
    );

    const content = (
        <>
            {entries.map((row: MedicineEntry) => (
                <EditableMedicineRow
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

export { MedicineTable };
