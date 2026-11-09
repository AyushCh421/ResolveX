const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

export const formatDate = (value) => (value ? dateFmt.format(new Date(value)) : '');
export const formatDateTime = (value) =>
  value ? `${dateFmt.format(new Date(value))}, ${timeFmt.format(new Date(value))}` : '';

export const timeAgo = (value) => {
  if (!value) return '';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(value);
};

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const firstName = (name = '') => name.split(/\s+/)[0] || '';

export const hoursToText = (hours) => {
  if (hours == null) return 'No data yet';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
};

// Pulls the readable message out of an axios error.
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message ||
  (err?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check your connection.' : fallback);
