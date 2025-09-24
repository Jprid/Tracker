import {type JSX} from "react";

interface ContextMenuProps {
    x: number;
    y: number;
    onEdit: () => void;
    onDelete: () => void;
}

function ContextMenu({ x, y, onEdit, onDelete }: ContextMenuProps): JSX.Element {
    return (
        <div
            className="context-menu"
            style={{
                position: 'fixed',
                top: y,
                left: x,
                zIndex: 1000,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="context-menu-item" onClick={onEdit}>
                Edit
            </div>
            <div className="context-menu-item" onClick={onDelete}>
                Delete
            </div>
        </div>
    );
}

export { ContextMenu };
