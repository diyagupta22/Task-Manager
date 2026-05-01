const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── MILESTONE 1: USER SCHEMA ────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // Never return password in queries by default
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

// ─── MILESTONE 1: SECURITY — Hash password before saving ────────────────────
// NEVER save plain-text passwords!
userSchema.pre('save', async function (next) {
  // Only hash if password field was modified (new user or password change)
  if (!this.isModified('password')) return next();

  try {
    // Salt rounds: 12 is strong; 10 is the common minimum
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance method: Compare entered password with hashed password ──────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: Return safe user object (no password) ─────────────────
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
