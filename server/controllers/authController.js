const User = require('../models/User');
const { asyncHandler, ApiError, str, signToken, publicUser } = require('../utils/helpers');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const name = str(req.body.name);
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const department = str(req.body.department).slice(0, 80);
  const adminCode = str(req.body.adminCode);

  const errors = {};
  if (name.length < 2 || name.length > 60) errors.name = 'Enter your name (2 to 60 characters).';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Use at least 8 characters with a letter and a number.';
  }
  if (Object.keys(errors).length) throw new ApiError(400, Object.values(errors)[0], errors);

  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists. Try signing in.');
  }

  // Admins are never created by choice of role: they need the invite code set in the server env.
  let role = 'student';
  if (adminCode) {
    if (!process.env.ADMIN_SIGNUP_CODE || adminCode !== process.env.ADMIN_SIGNUP_CODE) {
      throw new ApiError(403, 'That admin invite code is not valid.');
    }
    role = 'admin';
  }

  const user = await User.create({
    name,
    email,
    department,
    role,
    passwordHash: await User.hashPassword(password),
  });

  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) throw new ApiError(400, 'Enter your email and password.');

  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for unknown email and wrong password so accounts can't be probed.
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }

  res.json({ token: signToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = { register, login, me };
