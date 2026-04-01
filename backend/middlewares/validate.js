const AppError = require('../utils/AppError');

const validators = {
  register: (body) => {
    const { name, email, password, role } = body;
    if (!name || !email || !password)         return 'name, email and password are required';
    if (name.trim().length < 2)               return 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(email))        return 'Invalid email format';
    if (password.length < 6)                  return 'Password must be at least 6 characters';
    if (role && !['admin','employee'].includes(role)) return 'Role must be admin or employee';
    return null;
  },

  login: (body) => {
    const { email, password } = body;
    if (!email || !password)           return 'Email and password are required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
    return null;
  },

  applyLeave: (body) => {
    const { leaveType, startDate, endDate, reason } = body;
    const validTypes = ['sick', 'casual', 'earned', 'unpaid'];
    if (!leaveType || !startDate || !endDate || !reason) return 'leaveType, startDate, endDate and reason are required';
    if (!validTypes.includes(leaveType))                 return `leaveType must be one of: ${validTypes.join(', ')}`;
    if (reason.trim().length < 10)                       return 'Reason must be at least 10 characters';
    return null;
  },

  updateLeaveStatus: (body) => {
    const { status } = body;
    if (!status)                                    return 'status is required';
    if (!['approved', 'rejected'].includes(status)) return 'status must be approved or rejected';
    return null;
  },
};

const validate = (type) => (req, res, next) => {
  const error = validators[type]?.(req.body);
  if (error) return next(new AppError(error, 400));
  next();
};

module.exports = validate;
