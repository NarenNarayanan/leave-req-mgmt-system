const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/sendResponse');

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('Email already registered', 400));

  const user = await User.create({ name, email, password, role });

  const token = generateToken({ id: user._id, role: user.role });

  sendResponse(res, 201, 'User registered successfully', {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Email and password are required', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken({ id: user._id, role: user.role });

  sendResponse(res, 200, 'Login successful', {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// GET /api/v1/auth/me
const getMe = async (req, res) => {
  sendResponse(res, 200, 'User fetched', { user: req.user });
};

module.exports = { register, login, getMe };
