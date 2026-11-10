import { Link } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold">This page does not exist</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">The link may be old, or the address was typed wrong.</p>
      <Link to={user ? homeFor(user) : '/login'} className="btn btn-primary mt-6">
        {user ? 'Go to your dashboard' : 'Go to sign in'}
      </Link>
    </div>
  );
}
