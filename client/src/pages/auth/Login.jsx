import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthShell from '../../components/layout/AuthShell';
import PasswordInput from '../../components/common/PasswordInput';
import { useAuth, homeFor } from '../../context/AuthContext';
import { errorMessage } from '../../utils/format';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      const from = location.state?.from;
      const allowed = from && from.startsWith(user.role === 'admin' ? '/admin' : '/student');
      navigate(allowed ? from : homeFor(user), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use the email you registered with."
      footer={
        <>
          New to ResolveX?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/25 bg-bad-tint px-3.5 py-2.5 text-sm text-bad">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={update}
            placeholder="you@college.edu"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={update}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full !py-3">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
