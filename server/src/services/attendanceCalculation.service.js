const { DateTime } = require('luxon');
const { DEFAULT_TIMEZONE, toAppDateTime } = require('../utils/time');

class AttendanceCalculationService {
  /**
   * Calculates attendance metrics (late minutes, overtime minutes, status, duration)
   *
   * @param {Object} params
   * @param {string|Date|DateTime} params.checkInAt - Check-in timestamp
   * @param {string|Date|DateTime} [params.checkOutAt] - Check-out timestamp (nullable)
   * @param {Object} params.schedule - Work schedule object for this day
   * @param {string} params.schedule.start_time - e.g. "07:30"
   * @param {string} params.schedule.end_time - e.g. "16:00" or "14:30"
   * @param {boolean} params.schedule.is_workday - true for Mon-Fri, false for Sat/Sun
   * @param {boolean} [params.isHoliday=false] - true if current date is a registered public holiday
   * @param {number} [params.toleranceMinutes=0] - Grace period tolerance in minutes
   * @param {string} [params.zone=DEFAULT_TIMEZONE] - Timezone
   * @returns {Object} Calculated metrics
   */
  static calculate({
    checkInAt,
    checkOutAt = null,
    schedule,
    isHoliday = false,
    toleranceMinutes = 0,
    zone = DEFAULT_TIMEZONE
  }) {
    if (!checkInAt) {
      throw new Error('checkInAt is required for attendance calculation');
    }

    const checkInDt = toAppDateTime(checkInAt, zone);
    const checkOutDt = checkOutAt ? toAppDateTime(checkOutAt, zone) : null;

    const isNonWorkday = isHoliday || !schedule || schedule.is_workday === false;

    let lateMinutes = 0;
    let overtimeMinutes = 0;
    let earlyLeaveMinutes = 0;
    let workDurationMinutes = 0;
    let status = 'TEPAT_WAKTU';

    // 1. Calculate check-in status & late minutes
    if (isNonWorkday) {
      status = 'HARI_LIBUR';
      lateMinutes = 0;
    } else {
      // Normal workday
      const [startHour, startMinute] = (schedule.start_time || '07:30')
        .split(':')
        .map(Number);

      const scheduledStartDt = checkInDt.set({
        hour: startHour,
        minute: startMinute,
        second: 0,
        millisecond: 0
      });

      // Check difference in minutes
      const diffStartMinutes = Math.floor(checkInDt.diff(scheduledStartDt, 'minutes').minutes);

      if (diffStartMinutes > toleranceMinutes) {
        // Late is difference from exact scheduled start time
        lateMinutes = Math.max(0, diffStartMinutes);
        status = 'TERLAMBAT';
      } else {
        lateMinutes = 0;
        status = 'TEPAT_WAKTU';
      }
    }

    // 2. If checkOutAt exists, calculate duration, overtime, early leave
    if (checkOutDt) {
      workDurationMinutes = Math.max(0, Math.floor(checkOutDt.diff(checkInDt, 'minutes').minutes));

      if (isNonWorkday) {
        // On holidays / weekends: entire duration counts as overtime!
        overtimeMinutes = workDurationMinutes;
        status = 'HARI_LIBUR';
      } else {
        const [endHour, endMinute] = (schedule.end_time || '16:00')
          .split(':')
          .map(Number);

        const scheduledEndDt = checkInDt.set({
          hour: endHour,
          minute: endMinute,
          second: 0,
          millisecond: 0
        });

        // Overtime: actual check-out after scheduled check-out
        const diffEndMinutes = Math.floor(checkOutDt.diff(scheduledEndDt, 'minutes').minutes);

        if (diffEndMinutes > 0) {
          overtimeMinutes = diffEndMinutes;
          // If check-in was on time, status can reflect overtime if desired, or late takes precedence
          if (lateMinutes === 0) {
            status = 'LEMBUR';
          }
        } else if (diffEndMinutes < 0) {
          earlyLeaveMinutes = Math.abs(diffEndMinutes);
          if (lateMinutes === 0) {
            status = 'PULANG_CEPAT';
          }
        }
      }
    }

    return {
      work_date: checkInDt.toFormat('yyyy-MM-dd'),
      check_in_at: checkInDt.toJSDate(),
      check_out_at: checkOutDt ? checkOutDt.toJSDate() : null,
      status,
      late_minutes: lateMinutes,
      overtime_minutes: overtimeMinutes,
      early_leave_minutes: earlyLeaveMinutes,
      work_duration_minutes: workDurationMinutes,
      is_holiday: isHoliday,
      is_workday: !isNonWorkday
    };
  }
}

module.exports = AttendanceCalculationService;
