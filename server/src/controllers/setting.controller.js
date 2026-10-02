const SettingService = require('../services/setting.service');
const ApiResponse = require('../utils/response');

class SettingController {
  static async getAll(req, res, next) {
    try {
      const data = await SettingService.getAllSettings();
      return ApiResponse.success(res, 'Pengaturan berhasil dimuat', data);
    } catch (error) {
      next(error);
    }
  }

  static async updateSchedules(req, res, next) {
    try {
      const { schedules } = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const updated = await SettingService.updateSchedules(adminId, schedules, ipAddress);
      return ApiResponse.success(res, 'Jadwal kerja berhasil diperbarui', updated);
    } catch (error) {
      next(error);
    }
  }

  static async updateTolerance(req, res, next) {
    try {
      const { minutes } = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const updated = await SettingService.updateTolerance(adminId, minutes, ipAddress);
      return ApiResponse.success(res, 'Toleransi keterlambatan berhasil diperbarui', updated);
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req, res, next) {
    try {
      const locationData = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const updated = await SettingService.updateLocation(adminId, locationData, ipAddress);
      return ApiResponse.success(res, 'Pengaturan lokasi kantor berhasil diperbarui', updated);
    } catch (error) {
      next(error);
    }
  }

  static async updateCompanyInfo(req, res, next) {
    try {
      const companyData = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const updated = await SettingService.updateCompanyInfo(adminId, companyData, ipAddress);
      return ApiResponse.success(res, 'Informasi perusahaan dan karyawan berhasil disimpan', updated);
    } catch (error) {
      next(error);
    }
  }

  static async addHoliday(req, res, next) {
    try {
      const holidayData = req.body;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const created = await SettingService.addHoliday(adminId, holidayData, ipAddress);
      return ApiResponse.success(res, 'Hari libur berhasil ditambahkan', created, 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteHoliday(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      await SettingService.deleteHoliday(adminId, Number(id), ipAddress);
      return ApiResponse.success(res, 'Hari libur berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 15, entity } = req.query;
      const data = await SettingService.getAuditLogs(Number(page), Number(limit), entity);
      return ApiResponse.success(res, 'Audit log berhasil dimuat', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingController;
