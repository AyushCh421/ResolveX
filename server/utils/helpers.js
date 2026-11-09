const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Wraps async route handlers so rejected promises reach the error middleware.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Error carrying an HTTP status, caught by middleware/error.js
class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Only accept real strings. Objects like { "$ne": "" } (NoSQL injection) become ''.
const str = (value) => (typeof value === 'string' ? value.trim() : '');

// Escape user text before using it inside a RegExp.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Ticket format: RX-241109-7KQ2  (date + 4 unambiguous characters)
const TICKET_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generateTicketId = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const bytes = crypto.randomBytes(4);
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += TICKET_CHARS[bytes[i] % TICKET_CHARS.length];
  return `RX-${yy}${mm}${dd}-${suffix}`;
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  createdAt: user.createdAt,
});

module.exports = { asyncHandler, ApiError, str, escapeRegex, signToken, generateTicketId, publicUser };
