const AppError = require('./AppError');

const validateLeaveDates = (startDate, endDate, next) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(start) || isNaN(end)) {
    return next(new AppError('Invalid date format', 400));
  }
  if (start < today) {
    return next(new AppError('Start date cannot be in the past', 400));
  }
  if (end < start) {
    return next(new AppError('End date cannot be before start date', 400));
  }
  return true;
};

module.exports = { validateLeaveDates };
