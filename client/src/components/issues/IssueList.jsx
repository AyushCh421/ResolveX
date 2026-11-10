import { Link } from 'react-router-dom';
import { StatusBadge, PriorityText } from '../common/Badges';
import { formatDate } from '../../utils/format';

// One list, two layouts: a table from md up, stacked rows on phones.
// `admin` adds the reporter and department columns.
export default function IssueList({ issues, basePath, admin = false }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold text-muted">
              <th className="px-5 py-3">Ticket</th>
              <th className="px-3 py-3">Complaint</th>
              {admin ? <th className="px-3 py-3">Reported by</th> : <th className="px-3 py-3">Location</th>}
              <th className="px-3 py-3">Priority</th>
              {admin && <th className="px-3 py-3">Department</th>}
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3">Reported</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id} className="border-b border-line last:border-0 hover:bg-paper/70">
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[13px] text-muted">{issue.ticketId}</td>
                <td className="max-w-[280px] px-3 py-3.5">
                  <Link to={`${basePath}/${issue._id}`} className="font-semibold text-ink hover:text-brand hover:underline">
                    {issue.title}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-muted">{issue.category}</p>
                </td>
                {admin ? (
                  <td className="px-3 py-3.5">
                    <p>{issue.createdBy?.name || 'Unknown'}</p>
                    <p className="text-[13px] text-muted">{issue.location}</p>
                  </td>
                ) : (
                  <td className="px-3 py-3.5 text-muted">{issue.location}</td>
                )}
                <td className="px-3 py-3.5">
                  <PriorityText priority={issue.priority} />
                </td>
                {admin && (
                  <td className="px-3 py-3.5">
                    {issue.assignedDepartment || <span className="text-faint">Unassigned</span>}
                  </td>
                )}
                <td className="px-3 py-3.5">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-muted">{formatDate(issue.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {issues.map((issue) => (
          <li key={issue._id}>
            <Link to={`${basePath}/${issue._id}`} className="block px-4 py-4 hover:bg-paper/70">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold leading-snug">{issue.title}</p>
                <StatusBadge status={issue.status} />
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {issue.category}, {issue.location}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                <span className="font-mono">{issue.ticketId}</span>
                <span>{formatDate(issue.createdAt)}</span>
                <PriorityText priority={issue.priority} />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
