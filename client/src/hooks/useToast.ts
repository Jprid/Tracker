import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const { addToast, removeToast, clearAllToasts } = context;

    const success = (title: string, message?: string, duration?: number) => {
        addToast('success', title, message, duration);
    };

    const error = (title: string, message?: string, duration?: number) => {
        addToast('error', title, message, duration);
    };

    const warning = (title: string, message?: string, duration?: number) => {
        addToast('warning', title, message, duration);
    };

    const info = (title: string, message?: string, duration?: number) => {
        addToast('info', title, message, duration);
    };

    return {
        success,
        error,
        warning,
        info,
        removeToast,
        clearAllToasts,
    };
}
