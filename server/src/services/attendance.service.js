const db = require('../config/database');
const AttendanceRepository = require('../repositories/attendance.repository');
const UserRepository = require('../repositories/user.repository');
const ScheduleRepository = require('../repositories/schedule.repository');
const HolidayRepository = require('../repositories/holiday.repository');
const SettingRepository = require('../repositories/setting.repository');
const AuditLogRepository = require('../repositories/auditLog.repository');
const AttendanceCalculationService = require('./attendanceCalculation.service');
const { getNow, formatDate, formatIndonesianDate, formatIndonesianTime, formatDurationMinutes, toAppDateTime } = require('../utils/time');
const { validateLocationRadius } = require('../utils/geo');

class AttendanceService {
  /**
   * Helper to resolve the target employee/user for attendance
   */
  static async getTargetUser(userId) {
    if (userId) {
      return UserRepository.findById(userId);
    }
    const admin = await UserRepository.getFirstAdmin();
    if (!admin) {
      throw new Error('Pengguna sistem belum terdaftar');
    }
    return admin;
  }

  /**
   * Status overview for Landing Page
   */
  static async getLandingOverview(userId = null) {
    const user = await this.getTargetUser(userId);
    const now = getNow();
    const todayStr = formatDate(now);

    const todayAttendance = await AttendanceRepository.findByUserAndDate(user.id, todayStr);
    const history = await AttendanceRepository.findLastN(user.id, 5);

    const officeLocation = await SettingRepository.getByKey('office_location');
    const companyInfo = await SettingRepository.getByKey('company_info');

    const canCheckIn = !todayAttendance || !todayAttendance.check_in_at;
    const canCheckOut = Boolean(todayAttendance && todayAttendance.check_in_at && !todayAttendance.check_out_at);

    return {
      server_time: now.toISO(),
      server_timestamp: now.toMillis(),
      server_date_formatted: formatIndonesianDate(now),
      server_time_formatted: formatIndonesianTime(now),
      today_date: todayStr,
      user_name: user.name,
      company_info: companyInfo || null,
      can_check_in: canCheckIn,
      can_check_out: canCheckOut,
      today_attendance: todayAttendance,
      recent_history: history,
      location_config: {
        enabled: officeLocation?.enabled || false,
        name: officeLocation?.name || 'Kantor',
        radius_meters: officeLocation?.radius_meters || 100
      }
    };
  }

  /**
   * Perform Absen Datang (Check-in)
   */
  static async checkIn({ userId = null, lat = null, lng = null, notes = null, ipAddress = null }) {
    const user = await this.getTargetUser(userId);
    const now = getNow();
    const todayStr = formatDate(now);

    // 1. Check office location if enabled
    const officeLocation = await SettingRepository.getByKey('office_location');
    if (officeLocation && officeLocation.enabled) {
      if (lat === null || lng === null) {
        const err = new Error('Validasi lokasi kantor aktif. Harap izinkan akses GPS / Geolocation perangkat Anda.');
        err.statusCode = 400;
        throw err;
      }
      const { isWithin, distanceMeters } = validateLocationRadius(lat, lng, officeLocation);
      if (!isWithin) {
        const err = new Error(`Lokasi Anda berada di luar radius kantor (${distanceMeters}m dari kantor, radius diizinkan: ${officeLocation.radius_meters}m).`);
        err.statusCode = 400;
        throw err;
      }
    }

    // 2. Database transaction with check to prevent race conditions & double-check-in
    return db.transaction(async (trx) => {
      // Find today's attendance for update
      const existing = await AttendanceRepository.findByUserAndDate(user.id, todayStr, trx);
      if (existing && existing.check_in_at) {
        const err = new Error(`Anda sudah melakukan Absen Datang hari ini pada pukul ${formatIndonesianTime(existing.check_in_at)} WIB.`);
        err.statusCode = 400;
        throw err;
      }

      // 3. Fetch schedule & holiday
      const schedule = await ScheduleRepository.findByDayOfWeek(now.weekday);
      const holiday = await HolidayRepository.findByDate(todayStr);
      const toleranceSetting = await SettingRepository.getByKey('late_tolerance_minutes');
      const toleranceMinutes = toleranceSetting?.minutes || 0;

      // 4. Calculate metrics
      const calculation = AttendanceCalculationService.calculate({
        checkInAt: now,
        checkOutAt: null,
        schedule,
        isHoliday: Boolean(holiday),
        toleranceMinutes
      });

      let attendance;
      if (existing) {
        attendance = await AttendanceRepository.update(
          existing.id,
          {
            check_in_at: now.toJSDate(),
            check_in_lat: lat,
            check_in_lng: lng,
            status: calculation.status,
            late_minutes: calculation.late_minutes,
            notes: notes || existing.notes,
            is_manual: false
          },
          trx
        );
      } else {
        attendance = await AttendanceRepository.create(
          {
            user_id: user.id,
            work_date: todayStr,
            check_in_at: now.toJSDate(),
            check_in_lat: lat,
            check_in_lng: lng,
            status: calculation.status,
            late_minutes: calculation.late_minutes,
            overtime_minutes: 0,
            notes,
            is_manual: false
          },
          trx
        );
      }

      // 5. Audit log
      await AuditLogRepository.create(
        {
          userId: user.id,
          action: 'CHECK_IN',
          entity: 'ATTENDANCE',
          entityId: attendance.id,
          oldValues: null,
          newValues: {
            check_in_at: now.toISO(),
            status: calculation.status,
            late_minutes: calculation.late_minutes
          },
          ipAddress
        },
        trx
      );

      return {
        attendance,
        confirmation: {
          action: 'CHECK_IN',
          recorded_time: formatIndonesianTime(now),
          recorded_date: formatIndonesianDate(now),
          status: calculation.status,
          late_minutes: calculation.late_minutes,
          message: calculation.late_minutes > 0
            ? `Absen datang berhasil dicatat (Terlambat ${calculation.late_minutes} menit)`
            : 'Absen datang berhasil dicatat (Tepat Waktu)'
        }
      };
    });
  }

  /**
   * Perform Absen Pulang (Check-out)
   */
  static async checkOut({ userId = null, lat = null, lng = null, notes = null, ipAddress = null }) {
    const user = await this.getTargetUser(userId);
    const now = getNow();
    const todayStr = formatDate(now);

    // 1. Check office location if enabled
    const officeLocation = await SettingRepository.getByKey('office_location');
    if (officeLocation && officeLocation.enabled) {
      if (lat === null || lng === null) {
        const err = new Error('Validasi lokasi kantor aktif. Harap izinkan akses GPS / Geolocation perangkat Anda.');
        err.statusCode = 400;
        throw err;
      }
      const { isWithin, distanceMeters } = validateLocationRadius(lat, lng, officeLocation);
      if (!isWithin) {
        const err = new Error(`Lokasi Anda berada di luar radius kantor (${distanceMeters}m dari kantor, radius diizinkan: ${officeLocation.radius_meters}m).`);
        err.statusCode = 400;
        throw err;
      }
    }

    return db.transaction(async (trx) => {
      const existing = await AttendanceRepository.findByUserAndDate(user.id, todayStr, trx);

      if (!existing || !existing.check_in_at) {
        const err = new Error('Anda belum melakukan Absen Datang hari ini.');
        err.statusCode = 400;
        throw err;
      }

      if (existing.check_out_at) {
        const err = new Error(`Anda sudah melakukan Absen Pulang hari ini pada pukul ${formatIndonesianTime(existing.check_out_at)} WIB.`);
        err.statusCode = 400;
        throw err;
      }

      // Schedule & holiday
      const schedule = await ScheduleRepository.findByDayOfWeek(now.weekday);
      const holiday = await HolidayRepository.findByDate(todayStr);
      const toleranceSetting = await SettingRepository.getByKey('late_tolerance_minutes');
      const toleranceMinutes = toleranceSetting?.minutes || 0;

      // Recalculate with checkIn and checkOut
      const calculation = AttendanceCalculationService.calculate({
        checkInAt: existing.check_in_at,
        checkOutAt: now,
        schedule,
        isHoliday: Boolean(holiday),
        toleranceMinutes
      });

      const updatedNotes = notes
        ? (existing.notes ? `${existing.notes} | Pulang: ${notes}` : `Pulang: ${notes}`)
        : existing.notes;

      const updated = await AttendanceRepository.update(
        existing.id,
        {
          check_out_at: now.toJSDate(),
          check_out_lat: lat,
          check_out_lng: lng,
          status: calculation.status,
          late_minutes: calculation.late_minutes,
          overtime_minutes: calculation.overtime_minutes,
          notes: updatedNotes
        },
        trx
      );

      // Audit log
      await AuditLogRepository.create(
        {
          userId: user.id,
          action: 'CHECK_OUT',
          entity: 'ATTENDANCE',
          entityId: existing.id,
          oldValues: {
            check_out_at: null,
            status: existing.status
          },
          newValues: {
            check_out_at: now.toISO(),
            status: calculation.status,
            overtime_minutes: calculation.overtime_minutes,
            duration_minutes: calculation.work_duration_minutes
          },
          ipAddress
        },
        trx
      );

      return {
        attendance: updated,
        confirmation: {
          action: 'CHECK_OUT',
          recorded_time: formatIndonesianTime(now),
          recorded_date: formatIndonesianDate(now),
          work_duration: formatDurationMinutes(calculation.work_duration_minutes),
          overtime_formatted: formatDurationMinutes(calculation.overtime_minutes),
          overtime_minutes: calculation.overtime_minutes,
          early_leave_minutes: calculation.early_leave_minutes,
          status: calculation.status,
          message: calculation.overtime_minutes > 0
            ? `Absen pulang berhasil dicatat. Lembur: ${formatDurationMinutes(calculation.overtime_minutes)}`
            : 'Absen pulang berhasil dicatat. Selamat beristirahat!'
        }
      };
    });
  }

  /**
   * Admin Manual Create (Lupa absen)
   */
  static async createManual({ userId, adminId, workDate, checkInTime, checkOutTime, notes, ipAddress = null }) {
    const user = await this.getTargetUser(userId);

    const existing = await AttendanceRepository.findByUserAndDate(user.id, workDate);
    if (existing) {
      const err = new Error(`Data presensi untuk tanggal ${workDate} sudah ada. Silakan gunakan fitur Ubah/Koreksi.`);
      err.statusCode = 409;
      throw err;
    }

    const checkInDt = toAppDateTime(`${workDate}T${checkInTime}:00`);
    const checkOutDt = checkOutTime ? toAppDateTime(`${workDate}T${checkOutTime}:00`) : null;

    const schedule = await ScheduleRepository.findByDayOfWeek(checkInDt.weekday);
    const holiday = await HolidayRepository.findByDate(workDate);
    const toleranceSetting = await SettingRepository.getByKey('late_tolerance_minutes');

    const calculation = AttendanceCalculationService.calculate({
      checkInAt: checkInDt,
      checkOutAt: checkOutDt,
      schedule,
      isHoliday: Boolean(holiday),
      toleranceMinutes: toleranceSetting?.minutes || 0
    });

    return db.transaction(async (trx) => {
      const created = await AttendanceRepository.create(
        {
          user_id: user.id,
          work_date: workDate,
          check_in_at: checkInDt.toJSDate(),
          check_out_at: checkOutDt ? checkOutDt.toJSDate() : null,
          status: calculation.status,
          late_minutes: calculation.late_minutes,
          overtime_minutes: calculation.overtime_minutes,
          notes: `[Koreksi Manual] ${notes}`,
          is_manual: true
        },
        trx
      );

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'MANUAL_CREATE',
          entity: 'ATTENDANCE',
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

  /**
   * Admin Manual Update
   */
  static async updateManual({ id, adminId, checkInTime, checkOutTime, notes, ipAddress = null }) {
    const existing = await AttendanceRepository.findById(id);
    if (!existing) {
      const err = new Error('Data presensi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const workDateStr = formatDate(existing.work_date);
    const checkInDt = toAppDateTime(`${workDateStr}T${checkInTime}:00`);
    const checkOutDt = checkOutTime ? toAppDateTime(`${workDateStr}T${checkOutTime}:00`) : null;

    const schedule = await ScheduleRepository.findByDayOfWeek(checkInDt.weekday);
    const holiday = await HolidayRepository.findByDate(workDateStr);
    const toleranceSetting = await SettingRepository.getByKey('late_tolerance_minutes');

    const calculation = AttendanceCalculationService.calculate({
      checkInAt: checkInDt,
      checkOutAt: checkOutDt,
      schedule,
      isHoliday: Boolean(holiday),
      toleranceMinutes: toleranceSetting?.minutes || 0
    });

    return db.transaction(async (trx) => {
      const updatedNotes = notes.startsWith('[Koreksi Manual]') ? notes : `[Koreksi Manual] ${notes}`;

      const updated = await AttendanceRepository.update(
        id,
        {
          check_in_at: checkInDt.toJSDate(),
          check_out_at: checkOutDt ? checkOutDt.toJSDate() : null,
          status: calculation.status,
          late_minutes: calculation.late_minutes,
          overtime_minutes: calculation.overtime_minutes,
          notes: updatedNotes,
          is_manual: true
        },
        trx
      );

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'MANUAL_UPDATE',
          entity: 'ATTENDANCE',
          entityId: id,
          oldValues: existing,
          newValues: updated,
          ipAddress
        },
        trx
      );

      return updated;
    });
  }

  /**
   * Admin Manual Delete
   */
  static async deleteManual({ id, adminId, ipAddress = null }) {
    const existing = await AttendanceRepository.findById(id);
    if (!existing) {
      const err = new Error('Data presensi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    return db.transaction(async (trx) => {
      await AttendanceRepository.delete(id, trx);

      await AuditLogRepository.create(
        {
          userId: adminId,
          action: 'MANUAL_DELETE',
          entity: 'ATTENDANCE',
          entityId: id,
          oldValues: existing,
          newValues: null,
          ipAddress
        },
        trx
      );

      return true;
    });
  }
}

module.exports = AttendanceService;
