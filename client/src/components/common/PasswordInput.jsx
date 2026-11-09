import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ id, value, onChange, autoComplete, placeholder, invalid }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={`field pr-11 ${invalid ? 'border-bad' : ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-faint hover:text-ink"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
