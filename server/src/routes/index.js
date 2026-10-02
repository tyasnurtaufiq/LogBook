const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const attendanceRoutes = require('./attendance.routes');
const settingRoutes = require('./setting.routes');
const reportRoutes = require('./report.routes');

router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/settings', settingRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'epres-server'
  });
});

module.exports = router;
