const { DateTime } = require('luxon');

const DEFAULT_TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';

/**
 * Returns current DateTime in application timezone
 * @param {string} [zone]
 * @returns {DateTime}
 */
function getNow(zone = DEFAULT_TIMEZONE) {
  return DateTime.now().setZone(zone);
}

/**
 * Parses ISO string or JS Date to Luxon DateTime in specified timezone
 * @param {string|Date} value
 * @param {string} [zone]
 * @returns {DateTime}
 */
function toAppDateTime(value, zone = DEFAULT_TIMEZONE) {
  if (!value) return null;
  if (value instanceof DateTime) {
    return value.setZone(zone);
  }
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone });
  }
  return DateTime.fromISO(value, { zone });
}

/**
 * Formats a Date/DateTime to YYYY-MM-DD
 * @param {string|Date|DateTime} value
 * @param {string} [zone]
 * @returns {string}
 */
function formatDate(value, zone = DEFAULT_TIMEZONE) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (value instanceof DateTime) {
    return value.setZone(zone).toFormat('yyyy-MM-dd');
  }
  return toAppDateTime(value, zone).toFormat('yyyy-MM-dd');
}

/**
 * Formats Date to Indonesian Human Date (e.g. "Senin, 06 Oktober 2026")
 * @param {string|Date|DateTime} value
 * @param {string} [zone]
 * @returns {string}
 */
function formatIndonesianDate(value, zone = DEFAULT_TIMEZONE) {
  if (!value) return '-';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return DateTime.fromISO(value, { zone }).setLocale('id').toFormat('EEEE, dd MMMM yyyy');
  }
  const dt = value instanceof DateTime ? value.setZone(zone) : toAppDateTime(value, zone);
  return dt.setLocale('id').toFormat('EEEE, dd MMMM yyyy');
}

/**
 * Formats time to HH:mm WIB
 * @param {string|Date|DateTime} value
 * @param {string} [zone]
 * @returns {string}
 */
function formatIndonesianTime(value, zone = DEFAULT_TIMEZONE) {
  if (!value) return '-';
  const dt = value instanceof DateTime ? value.setZone(zone) : toAppDateTime(value, zone);
  return dt.toFormat('HH:mm');
}

/**
 * Converts minutes to readable string (e.g., "1j 30m" or "45 menit")
 * @param {number} minutes
 * @returns {string}
 */
function formatDurationMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0 menit';
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours > 0 && remMinutes > 0) {
    return `${hours} jam ${remMinutes} menit`;
  }
  if (hours > 0) {
    return `${hours} jam`;
  }
  return `${remMinutes} menit`;
}

module.exports = {
  DEFAULT_TIMEZONE,
  getNow,
  toAppDateTime,
  formatDate,
  formatIndonesianDate,
  formatIndonesianTime,
  formatDurationMinutes
};
