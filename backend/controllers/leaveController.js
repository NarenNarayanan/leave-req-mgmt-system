const Leave = require('../models/Leave');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/sendResponse');
const { validateLeaveDates } = require('../utils/leaveValidation');

// ── Employee ───────────────────────────────────────────────────────

// POST /api/v1/leave/apply
const applyLeave = async (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return next(new AppError('leaveType, startDate, endDate and reason are required', 400));
  }

  if (validateLeaveDates(startDate, endDate, next) !== true) return;

  // Prevent overlapping leave requests
  const overlap = await Leave.findOne({
    user: req.user._id,
    status: { $ne: 'rejected' },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
    ],
  });
  if (overlap) return next(new AppError('You already have a leave request overlapping these dates', 409));

  const leave = await Leave.create({
    user: req.user._id,
    leaveType,
    startDate,
    endDate,
    reason,
  });

  sendResponse(res, 201, 'Leave application submitted', { leave });
};

// GET /api/v1/leave/my
const getMyLeaves = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [leaves, total] = await Promise.all([
    Leave.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Leave.countDocuments(filter),
  ]);

  sendResponse(res, 200, 'Your leave requests', {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    leaves,
  });
};

// ── Admin ──────────────────────────────────────────────────────────

// GET /api/v1/leave/all
const getAllLeaves = async (req, res) => {
  const { status, userId, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;

  const skip = (page - 1) * limit;
  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Leave.countDocuments(filter),
  ]);

  sendResponse(res, 200, 'All leave requests', {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    leaves,
  });
};

// PUT /api/v1/leave/:id
const updateLeaveStatus = async (req, res, next) => {
  const { status, adminComment } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return next(new AppError('Status must be either "approved" or "rejected"', 400));
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) return next(new AppError('Leave request not found', 404));

  if (leave.status !== 'pending') {
    return next(new AppError(`Leave is already ${leave.status}. Cannot update.`, 400));
  }

  leave.status = status;
  leave.adminComment = adminComment || '';
  leave.reviewedBy = req.user._id;
  await leave.save();

  await leave.populate('user', 'name email');
  await leave.populate('reviewedBy', 'name email');

  sendResponse(res, 200, `Leave ${status} successfully`, { leave });
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
