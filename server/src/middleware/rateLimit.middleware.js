const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/response');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 kali percobaan gagal dalam 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Terlalu banyak percobaan login yang gagal. Silakan tunggu 15 menit sebelum mencoba kembali.',
      null,
      429
    );
  }
});

const attendanceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 20, // maksimal 20 request per menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Terlalu banyak permintaan presensi. Mohon tunggu beberapa saat.',
      null,
      429
    );
  }
});

module.exports = {
  loginLimiter,
  attendanceLimiter
};
