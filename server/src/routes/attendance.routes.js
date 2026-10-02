const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const validate = require('../middleware/validate.middleware');
const {
  checkInSchema,
  checkOutSchema,
  manualCreateSchema,
  manualUpdateSchema
} = require('../validations/attendance.schema');
const { attendanceLimiter } = require('../middleware/rateLimit.middleware');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// Public Landing Page routes (secured with rate limiting)
router.get('/landing-overview', AttendanceController.getLandingOverview);
router.post('/check-in', attendanceLimiter, validate(checkInSchema), AttendanceController.checkIn);
router.post('/check-out', attendanceLimiter, validate(checkOutSchema), AttendanceController.checkOut);

// Admin Dashboard protected routes
router.get('/list', authenticate, requireAdmin, AttendanceController.getList);
router.get('/stats', authenticate, requireAdmin, AttendanceController.getStats);
router.post('/manual', authenticate, requireAdmin, validate(manualCreateSchema), AttendanceController.createManual);
router.put('/manual/:id', authenticate, requireAdmin, validate(manualUpdateSchema), AttendanceController.updateManual);
router.delete('/manual/:id', authenticate, requireAdmin, AttendanceController.deleteManual);

module.exports = router;
