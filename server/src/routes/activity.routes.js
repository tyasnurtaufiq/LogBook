const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activity.controller');
const validate = require('../middleware/validate.middleware');
const {
  createActivitySchema,
  updateActivitySchema
} = require('../validations/activity.schema');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ActivityController.getAll);
router.get('/today', ActivityController.getToday);
router.get('/stats', ActivityController.getStats);
router.get('/:id', ActivityController.getById);
router.post('/', validate(createActivitySchema), ActivityController.create);
router.put('/:id', validate(updateActivitySchema), ActivityController.update);
router.delete('/:id', ActivityController.delete);

module.exports = router;

