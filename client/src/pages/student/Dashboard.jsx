import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { issueApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorNote, EmptyState, PageHeader } from '../../components/common/Feedback';
import IssueList from '../../components/issues/IssueList';
import StatStrip from '../../components/dashboard/StatStrip';
import { errorMessage, firstName } from '../../utils/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    issueApi
      .mine()
      .then((d) => setIssues(d.issues))
      .catch((err) => setError(errorMessage(err, 'Could not load your complaints.')));
  };
  useEffect(load, []);

  const count = (status) => issues.filter((i) => i.status === status).length;

  return (
    <>
      <PageHeader
        title={`Hi ${firstName(user.name)}`}
        subtitle="Here is where your complaints stand."
        action={
          <Link to="/student/new" className="btn btn-primary">
            <Plus size={16} />
            Report an issue
          </Link>
        }
      />

      {error && <ErrorNote message={error} onRetry={load} />}
      {!error && !issues && <Spinner />}

      {issues && (
        <div className="space-y-6">
          <StatStrip
            items={[
              { label: 'Total reported', value: issues.length },
              { label: 'Pending', value: count('Pending'), tone: 'text-[#8a5a00]' },
              { label: 'In progress', value: count('In Progress'), tone: 'text-brand' },
              { label: 'Resolved', value: count('Resolved'), tone: 'text-ok' },
            ]}
          />

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-bold">Recent complaints</h2>
              {issues.length > 5 && (
                <Link to="/student/complaints" className="text-sm font-semibold text-brand hover:underline">
                  View all {issues.length}
                </Link>
              )}
            </div>
            {issues.length === 0 ? (
              <EmptyState
                title="Nothing reported yet"
                action={
                  <Link to="/student/new" className="btn btn-primary">
                    Report your first issue
                  </Link>
                }
              >
                Spotted something broken on campus? Tell the team and track it here.
              </EmptyState>
            ) : (
              <IssueList issues={issues.slice(0, 5)} basePath="/student/complaints" />
            )}
          </section>
        </div>
      )}
    </>
  );
}
