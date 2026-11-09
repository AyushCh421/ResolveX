// Single source of truth for allowed values on the API side.
// The client keeps a matching copy in client/src/utils/constants.js

const CATEGORIES = [
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

const PRIORITIES = ['Low', 'Medium', 'High'];

const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const DEPARTMENTS = [
  'Civil & Maintenance',
  'Electrical',
  'IT & Network',
  'Hostel Office',
  'Housekeeping',
  'Security',
  'Academic Office',
  'Mess Committee',
];

const ACTIONS = ['CREATED', 'STATUS_CHANGED', 'DEPARTMENT_ASSIGNED', 'COMMENT'];

module.exports = { CATEGORIES, PRIORITIES, STATUSES, DEPARTMENTS, ACTIONS };
