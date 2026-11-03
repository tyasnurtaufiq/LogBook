const { z } = require('zod');

const createActivitySchema = z.object({
  body: z.object({
    activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional().nullable(),
    start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam mulai harus HH:mm').optional().nullable().or(z.literal('')),
    end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam selesai harus HH:mm').optional().nullable().or(z.literal('')),
    title: z.string({ required_error: 'Nama/judul kegiatan wajib diisi' }).min(2, 'Nama kegiatan minimal 2 karakter').max(255, 'Nama kegiatan maksimal 255 karakter'),
    location: z.string().max(150, 'Lokasi/sub bagian maksimal 150 karakter').optional().nullable().or(z.literal('')),
    description: z.string().max(2000, 'Deskripsi kegiatan maksimal 2000 karakter').optional().nullable().or(z.literal('')),
    output: z.string().max(1000, 'Hasil / output maksimal 1000 karakter').optional().nullable().or(z.literal('')),
    status: z.enum(['SELESAI', 'PROSES', 'PENDING']).default('SELESAI'),
    notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable().or(z.literal(''))
  })
});

const updateActivitySchema = z.object({
  body: z.object({
    activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional().nullable(),
    start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam mulai harus HH:mm').optional().nullable().or(z.literal('')),
    end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam selesai harus HH:mm').optional().nullable().or(z.literal('')),
    title: z.string().min(2, 'Nama kegiatan minimal 2 karakter').max(255, 'Nama kegiatan maksimal 255 karakter').optional(),
    location: z.string().max(150, 'Lokasi/sub bagian maksimal 150 karakter').optional().nullable().or(z.literal('')),
    description: z.string().max(2000, 'Deskripsi kegiatan maksimal 2000 karakter').optional().nullable().or(z.literal('')),
    output: z.string().max(1000, 'Hasil / output maksimal 1000 karakter').optional().nullable().or(z.literal('')),
    status: z.enum(['SELESAI', 'PROSES', 'PENDING']).optional(),
    notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable().or(z.literal(''))
  })
});

module.exports = {
  createActivitySchema,
  updateActivitySchema
};

