const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
    password: z.string({ required_error: 'Password wajib diisi' }).min(6, 'Password minimal 6 karakter')
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z.string().min(6, 'Password baru minimal 6 karakter')
  })
});

module.exports = {
  loginSchema,
  changePasswordSchema
};
