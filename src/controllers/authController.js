const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT and set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: user.id || user._id },
    process.env.JWT_SECRET || 'aonelub_super_secret',
    { expiresIn: '30d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  };

  // Return password-stripped user object
  const userResponse = {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || { street: '', city: '', postalCode: '', country: '' },
    avatar: user.avatar,
    investmentAmount: user.investmentAmount || 0
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: userResponse
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Google login via Firebase integration simulation
// @route   POST /api/auth/google-login
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google authentication requires email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        role: 'customer'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is already loaded in protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password simulation
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide email' });
  }

  // Simulate success to prevent enumeration
  return res.status(200).json({
    success: true,
    message: 'If email exists, a password reset link has been dispatched successfully.'
  });
};
