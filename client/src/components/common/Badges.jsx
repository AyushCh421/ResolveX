import { STATUS_STYLES, PRIORITY_STYLES } from '../../utils/constants';

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function PriorityText({ priority }) {
  return <span className={`text-sm font-medium ${PRIORITY_STYLES[priority] || ''}`}>{priority}</span>;
}
