import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { STATUS_STYLES, STATUSES } from '../../utils/constants';

const AXIS = { fontSize: 12, fill: '#5b6778' };
const TIP = { borderRadius: 8, border: '1px solid #dde2ea', fontSize: 13 };

export function CategoryChart({ data }) {
  const rows = data.map((d) => ({ name: d.category, Open: d.count - d.resolved, Resolved: d.resolved }));
  if (!rows.length) return <p className="py-16 text-center text-sm text-muted">No complaints yet.</p>;

  return (
    <div role="img" aria-label="Complaints by category, split into open and resolved" style={{ height: Math.max(rows.length * 38 + 40, 200) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 0 }} barSize={16}>
          <CartesianGrid horizontal={false} stroke="#eef1f5" />
          <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={118} tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TIP} cursor={{ fill: '#f3f5f8' }} />
          <Bar dataKey="Open" stackId="a" fill="#1f4fd8" />
          <Bar dataKey="Resolved" stackId="a" fill="#1e8e5a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ counts }) {
  const rows = STATUSES.map((s) => ({ name: s, value: counts[s] || 0 })).filter((r) => r.value > 0);
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (!total) return <p className="py-16 text-center text-sm text-muted">No complaints yet.</p>;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="h-44 w-44 shrink-0" role="img" aria-label="Complaints by status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
              {rows.map((r) => (
                <Cell key={r.name} fill={STATUS_STYLES[r.name].hex} />
              ))}
            </Pie>
            <Tooltip contentStyle={TIP} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2.5 text-sm">
        {STATUSES.map((s) => (
          <li key={s} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[s].dot}`} />
              {s}
            </span>
            <span className="font-semibold">{counts[s] || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendChart({ data }) {
  const rows = data.map((d) => ({
    day: new Date(`${d.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    Complaints: d.count,
  }));

  return (
    <div className="h-56" role="img" aria-label="Complaints reported per day over the last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f4fd8" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#1f4fd8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} interval={2} />
          <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TIP} />
          <Area type="monotone" dataKey="Complaints" stroke="#1f4fd8" strokeWidth={2.5} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
