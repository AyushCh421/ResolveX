import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth, homeFor } from '../../context/AuthContext';
import { initials } from '../../utils/format';

const STUDENT_LINKS = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/new', label: 'Report an issue' },
  { to: '/student/complaints', label: 'My complaints' },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/complaints', label: 'All complaints' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const desktopLink = ({ isActive }) =>
    `flex h-16 items-center border-b-2 px-0.5 text-[15px] font-medium transition-colors ${
      isActive ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;

  const mobileLink = ({ isActive }) =>
    `block rounded-lg px-3 py-2.5 text-[15px] font-medium ${
      isActive ? 'bg-brand-tint text-brand-dark' : 'text-ink hover:bg-paper'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link to={homeFor(user)} aria-label="ResolveX home">
            <Logo />
          </Link>
          <nav className="-mb-px hidden items-center gap-7 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2.5 pr-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand-dark">
              {initials(user?.name)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline !px-3 !py-2">
            <LogOut size={16} />
            Log out
          </button>
        </div>

        <button
          className="-mr-2 rounded-lg p-2 text-ink hover:bg-paper md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-4 pb-4 pt-3 md:hidden">
          <nav className="space-y-1" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={mobileLink}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand-dark">
                {initials(user?.name)}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs capitalize text-muted">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline !px-3 !py-2">
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
