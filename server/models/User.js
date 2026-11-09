const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    // Branch / hostel for students, office for admins. Optional.
    department: { type: String, trim: true, maxlength: 80, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 10);

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
