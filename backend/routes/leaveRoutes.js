const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.use(protect);

router.post('/apply', restrictTo('employee'), validate('applyLeave'),       applyLeave);
router.get('/my',     restrictTo('employee'),                                getMyLeaves);
router.get('/all',    restrictTo('admin'),                                   getAllLeaves);
router.put('/:id',    restrictTo('admin'),    validate('updateLeaveStatus'), updateLeaveStatus);

module.exports = router;
