import IssueDetailLoader from '../../components/issues/IssueDetailLoader';

export default function ManageComplaint() {
  return <IssueDetailLoader isAdmin backTo="/admin/complaints" backLabel="All complaints" />;
}
