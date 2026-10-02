const db = require('../config/database');
const SettingRepository = require('../repositories/setting.repository');
const ScheduleRepository = require('../repositories/schedule.repository');
const HolidayRepository = require('../repositories/holiday.repository');
const AuditLogRepository = require('../repositories/auditLog.repository');

class SettingService {
  static async getAllSettings() {
    const schedules = await ScheduleRepository.getAll();
    const settings = await SettingRepository.getAll();
    const holidays = await HolidayRepository.getAll();

    return {
      schedules,
      settings: {
        late_tolerance_minutes: settings.late_tolerance_minutes || { minutes: 0 },
        office_location: settings.office_location || { enabled: false, latitude: -6.2, longitude: 106.8, radius_meters: 100 },
        company_info: settings.company_info || {
          company_name: 'CV. Albisjogja',
          employee_name: 'Tyas Nur Taufiq'
        }
      },
      holidays
    };
  }

  static async updateSchedules(adminId, schedules, ipAddress = null) {
    return db.transaction(async (trx) => {
      const oldSchedules = await ScheduleRepository.getAll();
      await ScheduleRepository.updateAll(schedules, trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'UPDATE_SCHEDULES',
          entity: 'WORK_SCHEDULES',
          entityId: 'all',
          oldValues: oldSchedules,
          newValues: schedules,
          ipAddress
        },
        trx
      );

      return ScheduleRepository.getAll();
    });
  }

  static async updateTolerance(adminId, minutes, ipAddress = null) {
    return db.transaction(async (trx) => {
      const oldVal = await SettingRepository.getByKey('late_tolerance_minutes');
      const newVal = { minutes: Number(minutes) };
      await SettingRepository.upsert('late_tolerance_minutes', newVal, 'Toleransi keterlambatan (menit)', trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'UPDATE_SETTING',
          entity: 'SETTING',
          entityId: 'late_tolerance_minutes',
          oldValues: oldVal,
          newValues: newVal,
          ipAddress
        },
        trx
      );

      return newVal;
    });
  }

  static async updateLocation(adminId, locationData, ipAddress = null) {
    return db.transaction(async (trx) => {
      const oldVal = await SettingRepository.getByKey('office_location');
      await SettingRepository.upsert('office_location', locationData, 'Pengaturan Geofencing Kantor', trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'UPDATE_SETTING',
          entity: 'SETTING',
          entityId: 'office_location',
          oldValues: oldVal,
          newValues: locationData,
          ipAddress
        },
        trx
      );

      return locationData;
    });
  }

  static async updateCompanyInfo(adminId, companyData, ipAddress = null) {
    return db.transaction(async (trx) => {
      const oldVal = await SettingRepository.getByKey('company_info');
      await SettingRepository.upsert('company_info', companyData, 'Informasi Perusahaan dan Karyawan', trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'UPDATE_SETTING',
          entity: 'SETTING',
          entityId: 'company_info',
          oldValues: oldVal,
          newValues: companyData,
          ipAddress
        },
        trx
      );

      return companyData;
    });
  }

  static async addHoliday(adminId, holidayData, ipAddress = null) {
    return db.transaction(async (trx) => {
      const existing = await HolidayRepository.findByDate(holidayData.holiday_date);
      if (existing) {
        const err = new Error(`Tanggal merah ${holidayData.holiday_date} sudah terdaftar.`);
        err.statusCode = 409;
        throw err;
      }

      const created = await HolidayRepository.create(holidayData, trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'CREATE_HOLIDAY',
          entity: 'HOLIDAY',
          entityId: created.id,
          oldValues: null,
          newValues: created,
          ipAddress
        },
        trx
      );

      return created;
    });
  }

  static async deleteHoliday(adminId, id, ipAddress = null) {
    return db.transaction(async (trx) => {
      const holiday = await db('holidays').where({ id }).first();
      if (!holiday) {
        const err = new Error('Hari libur tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      await HolidayRepository.delete(id, trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'DELETE_HOLIDAY',
          entity: 'HOLIDAY',
          entityId: id,
          oldValues: holiday,
          newValues: null,
          ipAddress
        },
        trx
      );

      return true;
    });
  }

  static async getAuditLogs(page = 1, limit = 15, entity = null) {
    return AuditLogRepository.findPaginated({ page, limit, entity });
  }
}

module.exports = SettingService;
