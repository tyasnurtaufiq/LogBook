const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const UserRepository = require('../repositories/user.repository');

class AuthService {
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    };
  }

  static async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token tidak ditemukan');
      error.statusCode = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch {
      const error = new Error('Refresh token tidak valid atau telah kedaluwarsa');
      error.statusCode = 401;
      throw error;
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);
    return tokens;
  }
}

module.exports = AuthService;
