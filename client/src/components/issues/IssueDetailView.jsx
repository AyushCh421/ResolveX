import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, Tag, User, Calendar, Building2 } from 'lucide-react';
import { StatusBadge, PriorityText } from '../common/Badges';
import Timeline from './Timeline';
import { adminApi, issueApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { STATUSES, DEPARTMENTS } from '../../utils/constants';
import { errorMessage, formatDate } from '../../utils/format';

function Meta({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-faint" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}

// Used by both portals. Admins get the "Manage" panel; everyone gets the timeline and comments.
export default function IssueDetailView({ issue, activities, isAdmin, backTo, backLabel, onChange }) {
  const toast = useToast();

  // Comment box (both roles)
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  // Admin manage panel
  const [status, setStatus] = useState(issue.status);
  const [department, setDepartment] = useState(issue.assignedDepartment || '');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const dirty = status !== issue.status || department !== (issue.assignedDepartment || '') || remark.trim();

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const { activity } = await issueApi.comment(issue._id, comment.trim());
      onChange({ issue, activities: [...activities, activity] });
      setComment('');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await adminApi.update(issue._id, {
        status,
        assignedDepartment: department,
        remark: remark.trim(),
      });
      onChange(data);
      setStatus(data.issue.status);
      setDepartment(data.issue.assignedDepartment || '');
      setRemark('');
      toast.success('Complaint updated.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link to={backTo} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} />
        {backLabel}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[13px] text-muted">{issue.ticketId}</span>
              <StatusBadge status={issue.status} />
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-[28px]">{issue.title}</h1>
            <p className="mt-4 whitespace-pre-wrap break-words text-[15px] text-ink">{issue.description}</p>

            {issue.imageUrl && (
              <a href={issue.imageUrl} target="_blank" rel="noreferrer" className="mt-5 block w-fit">
                <img
                  src={issue.imageUrl}
                  alt={`Photo attached to ${issue.title}`}
                  className="max-h-80 rounded-lg border border-line object-cover"
                />
              </a>
            )}

            <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <Meta icon={Tag} label="Category">{issue.category}</Meta>
              <Meta icon={MapPin} label="Location">{issue.location}</Meta>
              <Meta icon={User} label="Reported by">{issue.createdBy?.name || 'Unknown'}</Meta>
              <Meta icon={Calendar} label="Reported on">{formatDate(issue.createdAt)}</Meta>
              <Meta icon={Building2} label="Handled by">
                {issue.assignedDepartment || <span className="text-faint">Not assigned yet</span>}
              </Meta>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs text-muted">Priority</p>
                  <PriorityText priority={issue.priority} />
                </div>
              </div>
            </div>
          </section>

          <section className="panel p-5 sm:p-6">
            <h2 className="mb-5 text-lg font-bold">Progress</h2>
            <Timeline activities={activities} />

            <form onSubmit={postComment} className="mt-7 border-t border-line pt-5">
              <label htmlFor="comment" className="field-label">
                {isAdmin ? 'Message the student' : 'Add a comment'}
              </label>
              <textarea
                id="comment"
                rows={3}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isAdmin ? 'Ask for details or share what is happening' : 'Add details or reply to the admin team'}
                className="field resize-y"
              />
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-xs text-faint">{comment.length}/500</span>
                <button type="submit" disabled={posting || !comment.trim()} className="btn btn-outline">
                  {posting && <Loader2 size={16} className="animate-spin" />}
                  Post comment
                </button>
              </div>
            </form>
          </section>
        </div>

        {isAdmin && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <form onSubmit={saveChanges} className="panel space-y-4 p-5">
              <h2 className="text-lg font-bold">Manage complaint</h2>

              <div>
                <label htmlFor="status" className="field-label">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="field">
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="department" className="field-label">Assigned department</label>
                <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="field">
                  <option value="">Unassigned</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="remark" className="field-label">
                  Remark <span className="font-normal text-faint">(the student can see this)</span>
                </label>
                <textarea
                  id="remark"
                  rows={4}
                  maxLength={500}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. Plumber visits tomorrow morning"
                  className="field resize-y"
                />
              </div>

              <button type="submit" disabled={saving || !dirty} className="btn btn-primary w-full">
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save changes
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
