const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/response');

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      // Set httpOnly cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, getCookieOptions());

      return ApiResponse.success(res, 'Login berhasil', {
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken;
      const result = await AuthService.refreshAccessToken(token);

      // Update cookie
      res.cookie('refreshToken', result.refreshToken, getCookieOptions());

      return ApiResponse.success(res, 'Token berhasil diperbarui', {
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res) {
    const opts = getCookieOptions();
    delete opts.maxAge;
    res.clearCookie('refreshToken', opts);
    return ApiResponse.success(res, 'Logout berhasil');
  }

  static async me(req, res) {
    return ApiResponse.success(res, 'Data user aktif', { user: req.user });
  }
}

module.exports = AuthController;
