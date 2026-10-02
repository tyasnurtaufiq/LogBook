require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'epres_super_secret_access_jwt_key_2026_wib_secure',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'epres_super_secret_refresh_jwt_key_2026_wib_secure',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  TIMEZONE: process.env.TIMEZONE || 'Asia/Jakarta'
};
