import Logo from '../common/Logo';

// Sample tickets shown beside the sign-in form so a first-time visitor sees what the product does.
const SAMPLE_TICKETS = [
  { title: 'Water cooler leaking, Library 2nd floor', status: 'In progress', dot: 'bg-brand', tilt: '-rotate-[1.2deg]' },
  { title: 'Tube light out in Computer Lab 3', status: 'Resolved', dot: 'bg-ok', tilt: 'rotate-[0.8deg] ml-4' },
  { title: 'Wi-Fi drops every evening in Hostel B', status: 'Pending', dot: 'bg-signal', tilt: '-rotate-[0.6deg]' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-brand px-12 py-10 text-white lg:flex">
        <Logo light />

        <div className="max-w-md">
          <h2 className="text-[40px] font-bold leading-[1.08]">Report it once. Watch it get fixed.</h2>
          <p className="mt-4 text-[17px] text-white/80">
            Broken lights, leaking taps, dead Wi-Fi. Tell the campus team where the problem is and follow it until
            it is resolved.
          </p>

          <ul className="mt-10 space-y-3.5">
            {SAMPLE_TICKETS.map((t) => (
              <li key={t.title} className={`stub flex items-center py-3.5 pr-5 text-ink shadow-[0_2px_0_rgba(0,0,0,0.12)] ${t.tilt}`}>
                <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
                  <span className="text-[11px] font-semibold text-muted">{t.status}</span>
                </div>
                <p className="pl-5 text-[15px] font-medium leading-snug">{t.title}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/70">Your complaints are visible only to you and the campus admin team.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[32px] font-bold">{title}</h1>
          <p className="mt-2 text-[15px] text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-sm text-muted">{footer}</div>
        </div>
      </main>
    </div>
  );
}
