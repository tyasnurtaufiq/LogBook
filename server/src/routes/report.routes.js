const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/html', ReportController.exportHtml);
router.get('/print', ReportController.exportHtml);
router.get('/laporan.html', ReportController.exportHtml);
router.get('/pdf', ReportController.exportPdf);
router.get('/laporan.pdf', ReportController.exportPdf);
router.get('/csv', ReportController.exportCsv);
router.get('/laporan.csv', ReportController.exportCsv);

module.exports = router;
