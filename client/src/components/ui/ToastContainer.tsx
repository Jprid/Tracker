import { useContext, type JSX } from 'react';
import { Toast } from './Toast';
import { ToastContext } from '../../contexts/ToastContext';
import './Toast.css';

function ToastContainer(): JSX.Element {
    const context = useContext(ToastContext);
    if (!context) {
        return <div className="toast-container" />;
    }

    const { toasts, removeToast } = context;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
}

export { ToastContainer };
