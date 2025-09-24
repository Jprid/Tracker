import { useEffect, useState, useCallback, type JSX } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps): JSX.Element {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300); // Match CSS transition duration
    }, [onClose, toast.id]);

    useEffect(() => {
        // Trigger enter animation
        const enterTimer = setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after duration
        const duration = toast.duration || 5000;
        const dismissTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(dismissTimer);
        };
    }, [toast.duration, handleClose]);    const getIcon = (type: ToastType): string => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    };

    return (
        <div
            className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''} ${isExiting ? 'toast-exiting' : ''}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="toast-content">
                <div className="toast-icon">
                    {getIcon(toast.type)}
                </div>
                <div className="toast-text">
                    <div className="toast-title">{toast.title}</div>
                    {toast.message && <div className="toast-message">{toast.message}</div>}
                </div>
                <button
                    className="toast-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ×
                </button>
            </div>
            <div className="toast-progress">
                <div
                    className={`toast-progress-bar toast-progress-${toast.type}`}
                    style={{ '--duration': `${toast.duration || 5000}ms` } as React.CSSProperties}
                />
            </div>
        </div>
    );
}

export { Toast };
