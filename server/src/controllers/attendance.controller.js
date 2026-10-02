const AttendanceService = require('../services/attendance.service');
const AttendanceRepository = require('../repositories/attendance.repository');
const ApiResponse = require('../utils/response');

class AttendanceController {
  /**
   * GET /api/attendance/landing-overview
   * Public landing page state & server time sync
   */
  static async getLandingOverview(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const data = await AttendanceService.getLandingOverview(userId);
      return ApiResponse.success(res, 'Overview presensi berhasil dimuat', data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/attendance/check-in
   * Absen Datang
   */
  static async checkIn(req, res, next) {
    try {
      const { lat, lng, notes } = req.body;
      const userId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const parsedLat = (lat !== undefined && lat !== null && lat !== '') ? Number(lat) : null;
      const parsedLng = (lng !== undefined && lng !== null && lng !== '') ? Number(lng) : null;

      const result = await AttendanceService.checkIn({
        userId,
        lat: parsedLat,
        lng: parsedLng,
        notes,
        ipAddress
      });

      return ApiResponse.success(res, result.confirmation.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/attendance/check-out
   * Absen Pulang
   */
  static async checkOut(req, res, next) {
    try {
      const { lat, lng, notes } = req.body;
      const userId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const parsedLat = (lat !== undefined && lat !== null && lat !== '') ? Number(lat) : null;
      const parsedLng = (lng !== undefined && lng !== null && lng !== '') ? Number(lng) : null;

      const result = await AttendanceService.checkOut({
        userId,
        lat: parsedLat,
        lng: parsedLng,
        notes,
        ipAddress
      });

      return ApiResponse.success(res, result.confirmation.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/attendance/list (Admin)
   * Server-side pagination, search, date range & status filter, sorting
   */
  static async getList(req, res, next) {
    try {
      const {
        search,
        startDate,
        endDate,
        status,
        page = 1,
        limit = 10,
        sortBy = 'work_date',
        sortOrder = 'desc'
      } = req.query;

      const targetUser = await AttendanceService.getTargetUser(req.user?.id);

      const result = await AttendanceRepository.findPaginated({
        userId: targetUser.id,
        search,
        startDate,
        endDate,
        status,
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder
      });

      return ApiResponse.success(res, 'Daftar presensi berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/attendance/stats (Admin Dashboard Summary)
   */
  static async getStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const targetUser = await AttendanceService.getTargetUser(req.user?.id);

      const stats = await AttendanceRepository.getSummaryStats({
        userId: targetUser.id,
        startDate,
        endDate
      });

      return ApiResponse.success(res, 'Statistik presensi berhasil dimuat', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/attendance/manual (Admin CRUD)
   */
  static async createManual(req, res, next) {
    try {
      const { work_date, check_in_time, check_out_time, notes } = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const created = await AttendanceService.createManual({
        userId: adminId,
        adminId,
        workDate: work_date,
        checkInTime: check_in_time,
        checkOutTime: check_out_time,
        notes,
        ipAddress
      });

      return ApiResponse.success(res, 'Presensi manual berhasil ditambahkan', created, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/attendance/manual/:id (Admin CRUD)
   */
  static async updateManual(req, res, next) {
    try {
      const { id } = req.params;
      const { check_in_time, check_out_time, notes } = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const updated = await AttendanceService.updateManual({
        id: Number(id),
        adminId,
        checkInTime: check_in_time,
        checkOutTime: check_out_time,
        notes,
        ipAddress
      });

      return ApiResponse.success(res, 'Koreksi presensi berhasil disimpan', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/attendance/manual/:id (Admin CRUD)
   */
  static async deleteManual(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      await AttendanceService.deleteManual({
        id: Number(id),
        adminId,
        ipAddress
      });

      return ApiResponse.success(res, 'Data presensi berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceController;
