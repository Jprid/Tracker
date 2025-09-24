import {useState, useEffect, useCallback, memo, type JSX, type MouseEvent} from "react";
import type {MedicineEntry, Entry, SubstanceTableProps, TabType} from "../../types/interfaces.ts";
import { TableTabs } from "./table/TableTabs.tsx";
import { EntryTable } from "./table/EntryTable.tsx";
import { MedicineTable } from "./table/MedicineTable.tsx";
import { AllTable } from "./table/AllTable.tsx";
import { ContextMenu } from "../ui/ContextMenu.tsx";
import { ConfirmationModal } from "../ui/ConfirmationModal.tsx";
import { UI_CONSTANTS } from "../../utils/constants.ts";
import './Table.css';


function Table(props: SubstanceTableProps): JSX.Element {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        entry: MedicineEntry | Entry;
    } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [entryToDelete, setEntryToDelete] = useState<MedicineEntry | Entry | null>(null);

    useEffect(() => {
        props.onDataChange(props.entries);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [props.entries, props.onDataChange]);

    const handleClickOutside = useCallback(() => {
        setContextMenu(null);
    }, []);

    const handleContextMenu = useCallback((event: MouseEvent<HTMLTableCellElement>, entry: MedicineEntry | Entry) => {
        event.preventDefault();
        event.stopPropagation();
        const cell = event.currentTarget as HTMLElement;
        const rect = cell.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let x = rect.right + UI_CONSTANTS.CONTEXT_MENU_OFFSET; // always position to the right of the cell
        let y = rect.top;       // align to top of the cell
        
        // Ensure menu doesn't overflow the right edge of viewport
        if (x + UI_CONSTANTS.CONTEXT_MENU_WIDTH > vw) {
            x = vw - UI_CONSTANTS.CONTEXT_MENU_WIDTH - UI_CONSTANTS.CONTEXT_MENU_OFFSET;
        }
        
        // Ensure menu doesn't go off the left edge (minimum position)
        if (x < UI_CONSTANTS.MIN_MENU_POSITION) {
            x = UI_CONSTANTS.MIN_MENU_POSITION;
        }
        
        // If menu would overflow bottom edge, nudge it up
        if (y + UI_CONSTANTS.CONTEXT_MENU_HEIGHT > vh) {
            y = Math.max(UI_CONSTANTS.MIN_MENU_POSITION, vh - UI_CONSTANTS.CONTEXT_MENU_HEIGHT - UI_CONSTANTS.MIN_MENU_POSITION);
        }
        
        setContextMenu({
            visible: true,
            x,
            y,
            entry: entry,
        });
    }, []);

    const handleEdit = useCallback(() => {
        if (contextMenu) {
            setEditingId(contextMenu.entry.id);
            setContextMenu(null);
        }
    }, [contextMenu]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
    }, []);

    const handleDelete = useCallback(() => {
        if (contextMenu) {
            setShowDeleteModal(true);
            setEntryToDelete(contextMenu.entry);
            setContextMenu(null);
        }
    }, [contextMenu]);

    const confirmDelete = useCallback(() => {
        if (entryToDelete && props.onDelete) {
            props.onDelete(entryToDelete);
        }
        setShowDeleteModal(false);
        setEntryToDelete(null);
    }, [entryToDelete, props.onDelete]);

    const cancelDelete = useCallback(() => {
        setShowDeleteModal(false);
        setEntryToDelete(null);
    }, []);

    const handleSave = useCallback((entry: MedicineEntry | Entry) => {
        if (props.onUpdate) {
            props.onUpdate(entry);
        }
        setEditingId(null);
    }, [props.onUpdate]);

    const onTabChange = useCallback((tab: TabType) => {
        props.onTabChange?.(tab);
    }, [props.onTabChange]);

    const renderTable = useCallback((selectedTab: TabType) => {
        if (selectedTab === 'entry') {
            return (
                <EntryTable
                    entries={props.entries as Entry[]}
                    editingId={editingId}
                    onContextMenu={handleContextMenu}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            );
        } else if (selectedTab === 'medicine') {
            return (
                <MedicineTable
                    entries={props.entries as MedicineEntry[]}
                    editingId={editingId}
                    onContextMenu={handleContextMenu}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            );
        } else if (selectedTab === 'all') {
            return (
                <AllTable
                    entries={props.habitEntries || []}
                    medicineEntries={props.medicineEntries || []}
                    editingId={editingId}
                    onContextMenu={handleContextMenu}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            );
        }
        return null;
    }, [props.entries, props.habitEntries, props.medicineEntries, editingId, handleContextMenu, handleSave, handleCancel]);

    return (
        <>
            {contextMenu?.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            {showDeleteModal && (
                <ConfirmationModal
                    title="Confirm Delete"
                    message="Are you sure you want to delete this entry?"
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
            <div className="table-wrapper d-flex flex-column">
                <TableTabs
                    selectedTab={props.selectedTab || 'all'}
                    onTabChange={onTabChange}
                />
                <div className="table-body-container">
                    {/* Loading overlay */}
                    {props.isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner">
                                <div className="spinner-ring"></div>
                                <div className="loading-text">Loading data...</div>
                            </div>
                        </div>
                    )}
                    <div className={`table-content ${props.isLoading ? 'loading' : ''}`}>
                        {renderTable(props.selectedTab || 'all')}
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(Table);