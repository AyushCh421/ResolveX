import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { issueApi } from '../../services/api';
import { Spinner, ErrorNote, EmptyState, PageHeader } from '../../components/common/Feedback';
import IssueList from '../../components/issues/IssueList';
import useDebounce from '../../hooks/useDebounce';
import { STATUSES } from '../../utils/constants';
import { errorMessage } from '../../utils/format';

export default function MyComplaints() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const q = useDebounce(search);

  const [issues, setIssues] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setError('');
    issueApi
      .mine({ status: status || undefined, q: q || undefined })
      .then((d) => !ignore && setIssues(d.issues))
      .catch((err) => !ignore && setError(errorMessage(err, 'Could not load your complaints.')));
    return () => {
      ignore = true;
    };
  }, [status, q]);

  const tabs = ['', ...STATUSES];
  const filtering = Boolean(status || q);

  return (
    <>
      <PageHeader
        title="My complaints"
        subtitle="Everything you have reported, newest first."
        action={
          <Link to="/student/new" className="btn btn-primary">
            <Plus size={16} />
            Report an issue
          </Link>
        }
      />

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
            {tabs.map((t) => (
              <button
                key={t || 'all'}
                role="tab"
                aria-selected={status === t}
                onClick={() => setStatus(t)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  status === t ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                {t || 'All'}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, ticket or place"
              aria-label="Search complaints"
              className="field !py-2 pl-9"
            />
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorNote message={error} />
          </div>
        ) : !issues ? (
          <Spinner />
        ) : issues.length === 0 ? (
          <EmptyState title={filtering ? 'No complaints match' : 'Nothing reported yet'}>
            {filtering ? 'Try a different status or search term.' : 'When you report an issue it will show up here.'}
          </EmptyState>
        ) : (
          <IssueList issues={issues} basePath="/student/complaints" />
        )}
      </section>
    </>
  );
}
