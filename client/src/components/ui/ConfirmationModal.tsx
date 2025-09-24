import {type JSX} from "react";
import './modal.css';

interface ConfirmationModalProps {
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmationModal({
    title,
    message,
    confirmText,
    cancelText = "Cancel",
    onConfirm,
    onCancel
}: ConfirmationModalProps): JSX.Element {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button
                        onClick={onCancel}
                        className="btn-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-confirm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { ConfirmationModal };
