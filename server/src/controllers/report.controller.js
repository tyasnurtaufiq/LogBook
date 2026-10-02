const AttendanceRepository = require('../repositories/attendance.repository');
const AttendanceService = require('../services/attendance.service');
const SettingRepository = require('../repositories/setting.repository');
const PdfReportService = require('../services/pdfReport.service');
const { getNow, formatDate } = require('../utils/time');
const { DateTime } = require('luxon');

class ReportController {
  /**
   * Helper to resolve start & end dates from query (?month=YYYY-MM or ?from=YYYY-MM-DD&to=YYYY-MM-DD)
   */
  static _resolveDateRange(req) {
    const isValidDate = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str.trim());
    const isValidMonth = (str) => typeof str === 'string' && /^\d{4}-\d{2}$/.test(str.trim());

    let from = null;
    let to = null;

    if (isValidMonth(req.query.month)) {
      const dt = DateTime.fromFormat(req.query.month.trim(), 'yyyy-MM', { zone: 'Asia/Jakarta' });
      if (dt.isValid) {
        from = dt.startOf('month').toFormat('yyyy-MM-dd');
        to = dt.endOf('month').toFormat('yyyy-MM-dd');
      }
    }

    if (!from && isValidDate(req.query.from)) {
      from = req.query.from.trim();
    }
    if (!to && isValidDate(req.query.to)) {
      to = req.query.to.trim();
    }

    return { from, to };
  }

  /**
   * GET /api/reports/pdf?month=YYYY-MM or ?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  static async exportPdf(req, res, next) {
    try {
      const now = getNow();
      const defaultStart = now.startOf('month').toFormat('yyyy-MM-dd');
      const defaultEnd = now.endOf('month').toFormat('yyyy-MM-dd');

      const { from, to } = ReportController._resolveDateRange(req);

      const user = await AttendanceService.getTargetUser(req.user?.id);
      const companyInfo = await SettingRepository.getByKey('company_info');

      const stats = await AttendanceRepository.getSummaryStats({
        userId: user.id,
        startDate: from,
        endDate: to
      });

      const records = await AttendanceRepository.findByDateRange(user.id, from, to);

      let effectiveStart = from;
      let effectiveEnd = to;
      if (!effectiveStart && records.length > 0) {
        effectiveStart = formatDate(records[0].work_date) || defaultStart;
      }
      if (!effectiveEnd && records.length > 0) {
        effectiveEnd = formatDate(records[records.length - 1].work_date) || defaultEnd;
      }
      if (!effectiveStart) effectiveStart = defaultStart;
      if (!effectiveEnd) effectiveEnd = defaultEnd;

      const filename = `Laporan_Presensi_${effectiveStart}_sd_${effectiveEnd}.pdf`;

      const pdfBuffer = await PdfReportService.generatePdfBuffer({
        records,
        summary: stats,
        companyInfo,
        startDate: effectiveStart,
        endDate: effectiveEnd
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/csv?month=YYYY-MM or ?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  static async exportCsv(req, res, next) {
    try {
      const now = getNow();
      const defaultStart = now.startOf('month').toFormat('yyyy-MM-dd');
      const defaultEnd = now.endOf('month').toFormat('yyyy-MM-dd');

      const { from, to } = ReportController._resolveDateRange(req);

      const user = await AttendanceService.getTargetUser(req.user?.id);
      const companyInfo = await SettingRepository.getByKey('company_info');
      const stats = await AttendanceRepository.getSummaryStats({
        userId: user.id,
        startDate: from,
        endDate: to
      });
      const records = await AttendanceRepository.findByDateRange(user.id, from, to);

      let effectiveStart = from;
      let effectiveEnd = to;
      if (!effectiveStart && records.length > 0) {
        effectiveStart = formatDate(records[0].work_date) || defaultStart;
      }
      if (!effectiveEnd && records.length > 0) {
        effectiveEnd = formatDate(records[records.length - 1].work_date) || defaultEnd;
      }
      if (!effectiveStart) effectiveStart = defaultStart;
      if (!effectiveEnd) effectiveEnd = defaultEnd;

      const csvContent = PdfReportService.generateCsvReport({
        records,
        summary: stats,
        companyInfo,
        startDate: effectiveStart,
        endDate: effectiveEnd
      });
      const filename = `Laporan_Presensi_${effectiveStart}_sd_${effectiveEnd}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      return res.status(200).send('\uFEFF' + csvContent); // BOM for Excel UTF-8 compatibility
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/html?month=YYYY-MM or ?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  static async exportHtml(req, res, next) {
    try {
      const now = getNow();
      const defaultStart = now.startOf('month').toFormat('yyyy-MM-dd');
      const defaultEnd = now.endOf('month').toFormat('yyyy-MM-dd');

      const { from, to } = ReportController._resolveDateRange(req);

      const user = await AttendanceService.getTargetUser(req.user?.id);
      const companyInfo = await SettingRepository.getByKey('company_info');

      const stats = await AttendanceRepository.getSummaryStats({
        userId: user.id,
        startDate: from,
        endDate: to
      });

      const records = await AttendanceRepository.findByDateRange(user.id, from, to);

      let effectiveStart = from;
      let effectiveEnd = to;
      if (!effectiveStart && records.length > 0) {
        effectiveStart = formatDate(records[0].work_date) || defaultStart;
      }
      if (!effectiveEnd && records.length > 0) {
        effectiveEnd = formatDate(records[records.length - 1].work_date) || defaultEnd;
      }
      if (!effectiveStart) effectiveStart = defaultStart;
      if (!effectiveEnd) effectiveEnd = defaultEnd;

      const autoPrint = req.query.autoprint !== 'false';

      const htmlContent = PdfReportService.generateHtmlReport({
        records,
        summary: stats,
        companyInfo,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        autoPrint
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(htmlContent);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
