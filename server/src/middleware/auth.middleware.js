const jwt = require('jsonwebtoken');
const config = require('../config/env');
const UserRepository = require('../repositories/user.repository');
const ApiResponse = require('../utils/response');

function isHtmlRequest(req) {
  const accept = req.headers.accept || '';
  const path = req.path || '';
  return (
    accept.includes('text/html') ||
    path.includes('/html') ||
    path.includes('/print') ||
    Boolean(req.query.token && accept.includes('text/html'))
  );
}

function renderAlertHtml({ title, message, code = 'TOKEN_EXPIRED' }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} • LogBook</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-image: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%),
                        radial-gradient(circle at bottom left, rgba(244, 63, 94, 0.08), transparent 40%);
    }
    .card {
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(244, 63, 94, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(244, 63, 94, 0.15);
      border-radius: 1.5rem;
      max-width: 440px;
      width: 100%;
      padding: 2.5rem 2rem;
      text-align: center;
      animation: enterCard 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes enterCard {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .icon-box {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.05));
      border: 1px solid rgba(244, 63, 94, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: #fb7185;
      box-shadow: 0 8px 24px -4px rgba(244, 63, 94, 0.25);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: rgba(244, 63, 94, 0.12);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.25);
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background-color: #f43f5e;
      box-shadow: 0 0 8px #f43f5e;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 0.925rem;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 2rem;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn-login {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.85rem 1.25rem;
      border-radius: 0.85rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #ffffff;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.35);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-login:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      transform: translateY(-1px);
      box-shadow: 0 14px 24px -5px rgba(79, 70, 229, 0.45);
    }
    .btn-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 0.85rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-close:hover {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.08);
    }
    .footer-note {
      margin-top: 1.5rem;
      font-size: 0.775rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </div>

    <div class="badge">
      <span class="badge-dot"></span>
      ${code === 'TOKEN_EXPIRED' ? 'Sesi Kedaluwarsa' : 'Akses Ditolak'}
    </div>

    <h1>${title}</h1>
    <p>${message}</p>

    <div class="actions">
      <a href="/login?expired=1" class="btn-login">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        Login Kembali ke Akun
      </a>
      <button onclick="window.close()" class="btn-close">
        Tutup Jendela Ini
      </button>
    </div>

    <div class="footer-note">
      Otomatis dialihkan ke halaman login dalam <span id="sec" style="font-weight: 600; color: #cbd5e1;">6</span> detik...
    </div>
  </div>

  <script>
    try {
      localStorage.removeItem('epres_access_token');
      localStorage.removeItem('epres_user');
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = '/login?expired=1';
      }
    } catch (e) {}

    let sec = 6;
    const secEl = document.getElementById('sec');
    const timer = setInterval(() => {
      sec--;
      if (secEl) secEl.textContent = sec;
      if (sec <= 0) {
        clearInterval(timer);
        window.location.href = '/login?expired=1';
      }
    }, 1000);
  </script>
</body>
</html>`;
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    const htmlMode = isHtmlRequest(req);

    if (!token) {
      if (htmlMode) {
        return res.status(401).setHeader('Content-Type', 'text/html; charset=utf-8').send(
          renderAlertHtml({
            title: 'Akses Ditolak',
            message: 'Token autentikasi tidak ditemukan. Silakan login ke aplikasi LogBook terlebih dahulu.',
            code: 'TOKEN_MISSING'
          })
        );
      }
      return ApiResponse.error(res, 'Akses ditolak: Token autentikasi tidak ditemukan', null, 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        if (htmlMode) {
          return res.status(401).setHeader('Content-Type', 'text/html; charset=utf-8').send(
            renderAlertHtml({
              title: 'Sesi Telah Berakhir',
              message: 'Sesi login Anda telah kedaluwarsa demi keamanan akun. Silakan login kembali untuk melanjutkan.',
              code: 'TOKEN_EXPIRED'
            })
          );
        }
        return ApiResponse.error(res, 'Sesi telah kedaluwarsa, silakan login kembali', { code: 'TOKEN_EXPIRED' }, 401);
      }

      if (htmlMode) {
        return res.status(401).setHeader('Content-Type', 'text/html; charset=utf-8').send(
          renderAlertHtml({
            title: 'Autentikasi Tidak Valid',
            message: 'Token akses tidak valid atau telah diubah. Silakan masuk kembali.',
            code: 'TOKEN_INVALID'
          })
        );
      }
      return ApiResponse.error(res, 'Token autentikasi tidak valid', null, 401);
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      if (htmlMode) {
        return res.status(401).setHeader('Content-Type', 'text/html; charset=utf-8').send(
          renderAlertHtml({
            title: 'Pengguna Tidak Ditemukan',
            message: 'Akun Anda tidak ditemukan di sistem. Silakan login dengan akun yang valid.',
            code: 'USER_NOT_FOUND'
          })
        );
      }
      return ApiResponse.error(res, 'Pengguna tidak ditemukan', null, 401);
    }

    // Attach user (without password hash)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    if (isHtmlRequest(req)) {
      return res.status(403).setHeader('Content-Type', 'text/html; charset=utf-8').send(
        renderAlertHtml({
          title: 'Akses Ditolak',
          message: 'Halaman ini khusus untuk pengguna dengan hak akses Administrator.',
          code: 'FORBIDDEN'
        })
      );
    }
    return ApiResponse.error(res, 'Akses terbatas untuk Administrator', null, 403);
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin
};

