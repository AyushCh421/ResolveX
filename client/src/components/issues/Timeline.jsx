import { CircleDot, RefreshCw, Building2, MessageSquare } from 'lucide-react';
import { formatDateTime } from '../../utils/format';

const ICONS = {
  CREATED: CircleDot,
  STATUS_CHANGED: RefreshCw,
  DEPARTMENT_ASSIGNED: Building2,
  COMMENT: MessageSquare,
};

function describe(a) {
  switch (a.action) {
    case 'CREATED':
      return 'Complaint submitted';
    case 'STATUS_CHANGED':
      return (
        <>
          Status changed from <strong>{a.oldValue}</strong> to <strong>{a.newValue}</strong>
        </>
      );
    case 'DEPARTMENT_ASSIGNED':
      return a.newValue ? (
        <>
          Assigned to <strong>{a.newValue}</strong>
          {a.oldValue ? <> (was {a.oldValue})</> : null}
        </>
      ) : (
        <>Department assignment removed</>
      );
    default:
      return 'Comment';
  }
}

export default function Timeline({ activities }) {
  if (!activities.length) return <p className="text-sm text-muted">No activity yet.</p>;

  return (
    <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line">
      {activities.map((a) => {
        const Icon = ICONS[a.action] || CircleDot;
        const isStaff = a.updatedBy?.role === 'admin';
        return (
          <li key={a._id} className="relative flex gap-4">
            <span className="relative z-10 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-line bg-white text-muted">
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm">{describe(a)}</p>
              {a.comment && (
                <p className="mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-paper px-3 py-2 text-sm text-ink">
                  {a.comment}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                {a.updatedBy?.name || 'Unknown user'}
                {isStaff ? ' (admin)' : ''}, {formatDateTime(a.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
