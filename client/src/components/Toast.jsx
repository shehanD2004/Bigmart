import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const ICON_STYLES = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const PROGRESS_STYLES = {
  success: 'bg-emerald-400',
  error: 'bg-rose-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
};

let toastId = 0;

const ToastItem = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const Icon = ICONS[toast.type] || Info;
  const duration = toast.duration || 4000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, toast.id, onRemove]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm max-w-sm w-full transition-all duration-300 ${
        STYLES[toast.type]
      } ${exiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}
      style={{ animation: exiting ? undefined : 'slideInRight 0.35s cubic-bezier(0.21,1.02,0.73,1)' }}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${ICON_STYLES[toast.type]}`} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-bold text-sm leading-tight">{toast.title}</p>}
        <p className="text-sm leading-snug mt-0.5 opacity-90">{toast.message}</p>
      </div>
      <button onClick={handleClose} className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors mt-0.5">
        <X className="w-3.5 h-3.5 opacity-50" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-xl overflow-hidden bg-black/5">
        <div
          className={`h-full transition-none ${PROGRESS_STYLES[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title = '', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message, title, duration }]);
  }, []);

  const toast = useCallback({
    success: (msg, title) => addToast('success', msg, title),
    error: (msg, title) => addToast('error', msg, title),
    warning: (msg, title) => addToast('warning', msg, title),
    info: (msg, title) => addToast('info', msg, title),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto relative">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
      {/* Keyframes */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
