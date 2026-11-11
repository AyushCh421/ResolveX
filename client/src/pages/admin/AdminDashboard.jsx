import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Spinner, ErrorNote, EmptyState, PageHeader } from '../../components/common/Feedback';
import StatStrip from '../../components/dashboard/StatStrip';
import { CategoryChart, StatusDonut, TrendChart } from '../../components/dashboard/Charts';
import { StatusBadge, PriorityText } from '../../components/common/Badges';
import { errorMessage, hoursToText, timeAgo } from '../../utils/format';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    adminApi
      .analytics()
      .then(setData)
      .catch((err) => setError(errorMessage(err, 'Could not load analytics.')));
  };
  useEffect(load, []);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="How complaints across campus are moving."
        action={
          <Link to="/admin/complaints" className="btn btn-outline">
            Manage complaints
          </Link>
        }
      />

      {error && <ErrorNote message={error} onRetry={load} />}
      {!error && !data && <Spinner label="Loading analytics" />}

      {data && (
        <div className="space-y-6">
          <StatStrip
            items={[
              { label: 'Total complaints', value: data.total },
              { label: 'Pending', value: data.pending, tone: 'text-[#8a5a00]' },
              { label: 'In progress', value: data.inProgress, tone: 'text-brand' },
              { label: 'Resolved', value: data.resolved, tone: 'text-ok' },
              {
                label: 'Resolution rate',
                value: `${data.resolutionRate}%`,
                note: `Average time to resolve: ${hoursToText(data.avgResolutionHours)}`,
              },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="panel p-5">
              <h2 className="mb-4 text-lg font-bold">Complaints by category</h2>
              <CategoryChart data={data.byCategory} />
            </section>

            <div className="space-y-6">
              <section className="panel p-5">
                <h2 className="mb-4 text-lg font-bold">Status breakdown</h2>
                <StatusDonut
                  counts={{
                    Pending: data.pending,
                    'In Progress': data.inProgress,
                    Resolved: data.resolved,
                    Rejected: data.rejected,
                  }}
                />
              </section>
            </div>
          </div>

          <section className="panel p-5">
            <h2 className="mb-4 text-lg font-bold">Reported in the last 14 days</h2>
            <TrendChart data={data.trend} />
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-bold">Waiting for action</h2>
              <Link to="/admin/complaints" className="text-sm font-semibold text-brand hover:underline">
                See all
              </Link>
            </div>
            {data.recent.length === 0 ? (
              <EmptyState title="All clear">No open complaints right now.</EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {data.recent.map((i) => (
                  <li key={i._id}>
                    <Link to={`/admin/complaints/${i._id}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5 hover:bg-paper/70">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{i.title}</p>
                        <p className="text-[13px] text-muted">
                          {i.createdBy?.name || 'Unknown'}, {i.location}, {timeAgo(i.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <PriorityText priority={i.priority} />
                        <StatusBadge status={i.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
