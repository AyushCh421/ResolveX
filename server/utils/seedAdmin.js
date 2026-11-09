// Creates (or promotes) the first admin account.
// Usage:  npm run seed:admin
// Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME from .env

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  const name = process.env.SEED_ADMIN_NAME || 'Campus Admin';

  if (!process.env.MONGO_URI || !email || password.length < 8) {
    console.error('Set MONGO_URI, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (8+ chars) in server/.env first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await User.hashPassword(password);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`Updated existing user ${email} and made them admin.`);
  } else {
    await User.create({ name, email, role: 'admin', department: 'Administration', passwordHash });
    console.log(`Created admin ${email}`);
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
