import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { issueApi } from '../../services/api';
import { Spinner, ErrorNote } from '../common/Feedback';
import IssueDetailView from './IssueDetailView';
import { errorMessage } from '../../utils/format';

// Fetches one complaint and its activity, then hands it to the shared view.
export default function IssueDetailLoader({ isAdmin, backTo, backLabel }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setData(null);
    issueApi
      .get(id)
      .then(setData)
      .catch((err) => setError(errorMessage(err, 'Could not load this complaint.')));
  }, [id]);

  useEffect(load, [load]);

  if (error) return <ErrorNote message={error} onRetry={load} />;
  if (!data) return <Spinner label="Loading complaint" />;

  return (
    <IssueDetailView
      // Remount when the server sends back a new status so the manage form resets cleanly.
      key={`${data.issue._id}-${data.issue.updatedAt}-${data.activities.length}`}
      issue={data.issue}
      activities={data.activities}
      isAdmin={isAdmin}
      backTo={backTo}
      backLabel={backLabel}
      onChange={(next) => setData(next)}
    />
  );
}
