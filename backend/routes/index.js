const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

router.use('/auth',   require('./authRoutes'));
router.use('/leave',  require('./leaveRoutes'));
// router.use('/users',  require('./userRoutes'));

module.exports = router;
