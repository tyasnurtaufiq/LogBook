const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/setting.controller');
const validate = require('../middleware/validate.middleware');
const {
  updateSchedulesSchema,
  updateToleranceSchema,
  updateLocationSchema,
  createHolidaySchema,
  updateCompanyInfoSchema
} = require('../validations/setting.schema');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate, requireAdmin);

router.get('/', SettingController.getAll);
router.put('/schedules', validate(updateSchedulesSchema), SettingController.updateSchedules);
router.put('/tolerance', validate(updateToleranceSchema), SettingController.updateTolerance);
router.put('/location', validate(updateLocationSchema), SettingController.updateLocation);
router.put('/company', validate(updateCompanyInfoSchema), SettingController.updateCompanyInfo);
router.post('/holidays', validate(createHolidaySchema), SettingController.addHoliday);
router.delete('/holidays/:id', SettingController.deleteHoliday);
router.get('/audit-logs', SettingController.getAuditLogs);

module.exports = router;
