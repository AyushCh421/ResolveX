import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = crypto.randomUUID();
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex max-w-md items-start gap-2.5 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-lg"
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#6fd3a2]" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#ff9b94]" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/60 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
