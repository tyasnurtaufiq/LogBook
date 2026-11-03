const ActivityService = require('../services/activity.service');
const ApiResponse = require('../utils/response');
const { DateTime } = require('luxon');

class ActivityController {
  /**
   * GET /api/activities
   * List activities with filters, search, and pagination
   */
  static async getAll(req, res, next) {
    try {
      let {
        page = 1,
        limit = 10,
        search = '',
        status = 'ALL',
        startDate,
        endDate,
        month,
        sortBy = 'activity_date',
        sortOrder = 'desc'
      } = req.query;

      // Handle month helper ?month=YYYY-MM
      if (month && /^\d{4}-\d{2}$/.test(month.trim())) {
        const dt = DateTime.fromFormat(month.trim(), 'yyyy-MM', { zone: 'Asia/Jakarta' });
        if (dt.isValid) {
          startDate = dt.startOf('month').toFormat('yyyy-MM-dd');
          endDate = dt.endOf('month').toFormat('yyyy-MM-dd');
        }
      }

      const userId = req.user?.id;
      const result = await ActivityService.getActivities(userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search,
        status,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });

      return ApiResponse.success(res, 'Daftar kegiatan harian berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/activities/today
   * Quick access for today's activities
   */
  static async getToday(req, res, next) {
    try {
      const userId = req.user?.id;
      const activities = await ActivityService.getTodayActivities(userId);
      return ApiResponse.success(res, 'Kegiatan hari ini berhasil dimuat', activities);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/activities/stats
   * Summary metrics for dashboard
   */
  static async getStats(req, res, next) {
    try {
      let { startDate, endDate, month } = req.query;

      if (month && /^\d{4}-\d{2}$/.test(month.trim())) {
        const dt = DateTime.fromFormat(month.trim(), 'yyyy-MM', { zone: 'Asia/Jakarta' });
        if (dt.isValid) {
          startDate = dt.startOf('month').toFormat('yyyy-MM-dd');
          endDate = dt.endOf('month').toFormat('yyyy-MM-dd');
        }
      }

      const userId = req.user?.id;
      const stats = await ActivityService.getSummaryStats({
        userId,
        startDate,
        endDate
      });

      return ApiResponse.success(res, 'Statistik kegiatan berhasil dimuat', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/activities/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const activity = await ActivityService.getActivityById(id, userId);
      return ApiResponse.success(res, 'Detail kegiatan berhasil dimuat', activity);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/activities
   */
  static async create(req, res, next) {
    try {
      const userId = req.user?.id;
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const created = await ActivityService.createActivity({
        userId,
        data: req.body,
        ipAddress
      });

      return ApiResponse.success(res, 'Kegiatan harian berhasil ditambahkan', created, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/activities/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const ipAddress = req.ip || req.connection?.remoteAddress;

      const updated = await ActivityService.updateActivity({
        id,
        userId,
        data: req.body,
        ipAddress
      });

      return ApiResponse.success(res, 'Kegiatan harian berhasil diperbarui', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/activities/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const ipAddress = req.ip || req.connection?.remoteAddress;

      await ActivityService.deleteActivity({
        id,
        userId,
        ipAddress
      });

      return ApiResponse.success(res, 'Kegiatan harian berhasil dihapus', { id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ActivityController;

