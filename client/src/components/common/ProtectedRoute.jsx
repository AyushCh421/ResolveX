import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, homeFor } from '../../context/AuthContext';
import { Spinner } from './Feedback';

// Wrap a group of routes. `role` limits it to students or admins.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;

  return <Outlet />;
}

// Login and register: signed-in users get sent to their own home instead.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking your session" />;
  if (user) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
