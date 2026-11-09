// Keep in sync with server/utils/constants.js

export const CATEGORIES = [
  'Infrastructure',
  'Electricity',
  'Water & Plumbing',
  'Hostel',
  'Mess & Canteen',
  'Internet & Wi-Fi',
  'Cleanliness',
  'Security',
  'Academic',
  'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High'];

export const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

export const DEPARTMENTS = [
  'Civil & Maintenance',
  'Electrical',
  'IT & Network',
  'Hostel Office',
  'Housekeeping',
  'Security',
  'Academic Office',
  'Mess Committee',
];

export const PLACES = [
  'Academic Block',
  'Library',
  'Computer Lab',
  'Hostel (Boys)',
  'Hostel (Girls)',
  'Mess / Canteen',
  'Sports Complex',
  'Admin Block',
  'Auditorium',
  'Parking & Gate',
  'Campus Grounds',
  'Other',
];

// Colours used for badges and charts. One place so they never drift apart.
export const STATUS_STYLES = {
  Pending: { text: 'text-[#8a5a00]', bg: 'bg-signal-tint', dot: 'bg-signal', hex: '#f5a524' },
  'In Progress': { text: 'text-brand-dark', bg: 'bg-brand-tint', dot: 'bg-brand', hex: '#1f4fd8' },
  Resolved: { text: 'text-ok', bg: 'bg-ok-tint', dot: 'bg-ok', hex: '#1e8e5a' },
  Rejected: { text: 'text-bad', bg: 'bg-bad-tint', dot: 'bg-bad', hex: '#c2413b' },
};

export const PRIORITY_STYLES = {
  Low: 'text-muted',
  Medium: 'text-[#8a5a00]',
  High: 'text-bad',
};
