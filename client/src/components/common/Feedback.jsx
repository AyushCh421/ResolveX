import { Loader2, AlertCircle } from 'lucide-react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted" role="status">
      <Loader2 className="animate-spin" size={18} />
      {label}
    </div>
  );
}

export function ErrorNote({ message, onRetry }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-bad/25 bg-bad-tint px-4 py-3 text-sm text-bad" role="alert">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
