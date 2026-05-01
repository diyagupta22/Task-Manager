const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
};

// ─── Helper: Send token response ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.toSafeObject(),
  });
};

// ─── MILESTONE 2: POST /api/auth/register ────────────────────────────────────
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new user (password is hashed via pre-save hook in User model)
    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res, 'Account created successfully! Welcome aboard.');
  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
});

// ─── MILESTONE 2: POST /api/auth/login ───────────────────────────────────────
// @desc    Login user & return JWT
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user — explicitly select password (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Use a generic message to prevent email enumeration attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare entered password against hashed password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// @desc    Get current logged-in user profile
// @access  Private (requires valid JWT)
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// @desc    Logout (client should delete the token; this is a server acknowledgment)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove the token from storage.',
  });
});

module.exports = router;
