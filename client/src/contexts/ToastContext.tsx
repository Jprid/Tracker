import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { ToastMessage, ToastType } from '../components/ui/Toast';

interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

function ToastProvider({ children }: ToastProviderProps): ReactNode {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const toast: ToastMessage = {
            id,
            type,
            title,
            message,
            duration: duration || 5000,
        };

        setToasts((prevToasts) => [...prevToasts, toast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const value: ToastContextType = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
}

export { ToastContext, ToastProvider };
export type { ToastContextType };
