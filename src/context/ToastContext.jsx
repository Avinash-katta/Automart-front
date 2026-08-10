import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded bg-white border border-gray-100 shadow-lg translate-x-0 animate-[slideIn_0.3s_ease-out]`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-black" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              <span className="text-sm font-medium text-gray-800">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
