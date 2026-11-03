const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Presensi / Attendance reports
router.get('/html', ReportController.exportHtml);
router.get('/print', ReportController.exportHtml);
router.get('/laporan.html', ReportController.exportHtml);
router.get('/pdf', ReportController.exportPdf);
router.get('/laporan.pdf', ReportController.exportPdf);
router.get('/csv', ReportController.exportCsv);
router.get('/laporan.csv', ReportController.exportCsv);

// Kegiatan Harian / Daily Activity reports
router.get('/activities/html', ReportController.exportActivitiesHtml);
router.get('/activities/print', ReportController.exportActivitiesHtml);
router.get('/activities.html', ReportController.exportActivitiesHtml);
router.get('/activities/pdf', ReportController.exportActivitiesPdf);
router.get('/activities.pdf', ReportController.exportActivitiesPdf);
router.get('/activities/csv', ReportController.exportActivitiesCsv);
router.get('/activities.csv', ReportController.exportActivitiesCsv);

module.exports = router;
