import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Spinner, ErrorNote, EmptyState, PageHeader } from '../../components/common/Feedback';
import IssueList from '../../components/issues/IssueList';
import useDebounce from '../../hooks/useDebounce';
import { CATEGORIES, DEPARTMENTS, PRIORITIES, STATUSES } from '../../utils/constants';
import { errorMessage } from '../../utils/format';

const EMPTY = { status: '', category: '', priority: '', department: '', sort: 'newest' };

function Select({ label, value, onChange, options, allLabel }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="field !py-2 text-sm">
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export default function AdminComplaints() {
  const [filters, setFilters] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search);

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const setFilter = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  useEffect(() => setPage(1), [q]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    adminApi
      .list({
        q: q || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        department: filters.department || undefined,
        sort: filters.sort,
        page,
        limit: 10,
      })
      .then((d) => !ignore && setResult(d))
      .catch((err) => !ignore && setError(errorMessage(err, 'Could not load complaints.')))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [q, filters, page]);

  const active = q || filters.status || filters.category || filters.priority || filters.department;
  const reset = () => {
    setSearch('');
    setFilters(EMPTY);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="All complaints"
        subtitle={result ? `${result.total} ${result.total === 1 ? 'complaint' : 'complaints'}${active ? ' match your filters' : ' in total'}` : ' '}
      />

      <section className="panel overflow-hidden">
        <div className="space-y-3 border-b border-line p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, ticket ID, location or description"
              aria-label="Search complaints"
              className="field pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
            <Select label="Status" value={filters.status} onChange={setFilter('status')} options={STATUSES} allLabel="All statuses" />
            <Select label="Category" value={filters.category} onChange={setFilter('category')} options={CATEGORIES} allLabel="All categories" />
            <Select label="Priority" value={filters.priority} onChange={setFilter('priority')} options={PRIORITIES} allLabel="All priorities" />
            <Select
              label="Department"
              value={filters.department}
              onChange={setFilter('department')}
              options={['Unassigned', ...DEPARTMENTS]}
              allLabel="All departments"
            />
            <select
              aria-label="Sort"
              value={filters.sort}
              onChange={(e) => setFilter('sort')(e.target.value)}
              className="field !py-2 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="updated">Recently updated</option>
            </select>
            <button onClick={reset} disabled={!active && filters.sort === 'newest'} className="btn btn-outline !py-2">
              <X size={15} />
              Clear
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorNote message={error} />
          </div>
        ) : !result ? (
          <Spinner />
        ) : result.issues.length === 0 ? (
          <EmptyState title={active ? 'No complaints match' : 'No complaints yet'}>
            {active ? 'Loosen a filter or clear the search.' : 'Reports from students will appear here.'}
          </EmptyState>
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : ''}>
            <IssueList issues={result.issues} basePath="/admin/complaints" admin />
          </div>
        )}

        {result && result.pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
            <span className="text-muted">
              Page {result.page} of {result.pages}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-outline !px-3 !py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
              <button className="btn btn-outline !px-3 !py-1.5" disabled={page >= result.pages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
