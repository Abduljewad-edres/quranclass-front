import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

let id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const toast = { id: ++id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);
  }, []);

  const remove = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle };

  return (
    <ToastContext.Provider value={{ success: (m) => add(m, 'success'), error: (m) => add(m, 'error'), warning: (m) => add(m, 'warning') }}>
      {children}
      <div className={styles.container} aria-live="polite">
        {toasts.map(toast => {
          const Icon = icons[toast.type] || CheckCircle;
          return (
            <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
              <Icon size={16} />
              <span>{toast.message}</span>
              <button onClick={() => remove(toast.id)} aria-label="Dismiss" className={styles.dismiss}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
