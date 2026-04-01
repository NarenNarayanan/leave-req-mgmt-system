const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { JWT_SECRET } = require('../config/env');

// Verifies JWT and attaches user to req
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Access denied.', 401));
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, JWT_SECRET); // throws on invalid/expired
  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError('User no longer exists', 401));

  req.user = user;
  next();
};

// Restricts access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
