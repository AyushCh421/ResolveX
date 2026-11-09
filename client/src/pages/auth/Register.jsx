import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthShell from '../../components/layout/AuthShell';
import PasswordInput from '../../components/common/PasswordInput';
import { useAuth, homeFor } from '../../context/AuthContext';
import { errorMessage } from '../../utils/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) {
    e.password = 'Use at least 8 characters with a letter and a number.';
  }
  if (f.confirm !== f.password) e.confirm = 'The two passwords do not match.';
  return e;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', department: '', password: '', confirm: '', adminCode: '' });
  const [showCode, setShowCode] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        password: form.password,
        adminCode: showCode ? form.adminCode.trim() : '',
      });
      navigate(homeFor(user), { replace: true });
    } catch (err) {
      setServerError(errorMessage(err, 'Could not create your account.'));
      setSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: update,
    'aria-invalid': errors[name] ? true : undefined,
    className: `field ${errors[name] ? 'border-bad' : ''}`,
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a minute. You can start reporting right after."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg border border-bad/25 bg-bad-tint px-3.5 py-2.5 text-sm text-bad">
            {serverError}
          </p>
        )}

        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input {...fieldProps('name')} autoComplete="name" autoFocus />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input {...fieldProps('email')} type="email" autoComplete="email" placeholder="you@college.edu" />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="department" className="field-label">
            Branch or hostel <span className="font-normal text-faint">(optional)</span>
          </label>
          <input {...fieldProps('department')} placeholder="e.g. CSE, Boys Hostel 2" />
        </div>

        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={update}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <p className="field-error">{errors.password}</p>
          ) : (
            <p className="mt-1.5 text-[13px] text-faint">At least 8 characters, with a letter and a number.</p>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="field-label">Confirm password</label>
          <PasswordInput
            id="confirm"
            value={form.confirm}
            onChange={update}
            autoComplete="new-password"
            invalid={Boolean(errors.confirm)}
          />
          {errors.confirm && <p className="field-error">{errors.confirm}</p>}
        </div>

        {showCode ? (
          <div>
            <label htmlFor="adminCode" className="field-label">Admin invite code</label>
            <input {...fieldProps('adminCode')} autoComplete="off" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCode(true)}
            className="text-sm font-medium text-muted underline underline-offset-2 hover:text-ink"
          >
            I have an admin invite code
          </button>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full !py-3">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
