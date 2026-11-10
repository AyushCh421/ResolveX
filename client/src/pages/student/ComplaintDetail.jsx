import IssueDetailLoader from '../../components/issues/IssueDetailLoader';

export default function ComplaintDetail() {
  return <IssueDetailLoader isAdmin={false} backTo="/student/complaints" backLabel="My complaints" />;
}
