const { z } = require('zod');

const checkInSchema = z.object({
  body: z.object({
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable()
  })
});

const checkOutSchema = z.object({
  body: z.object({
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable()
  })
});

const manualCreateSchema = z.object({
  body: z.object({
    work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
    check_in_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format jam masuk harus HH:mm atau HH:mm:ss'),
    check_out_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format jam pulang harus HH:mm atau HH:mm:ss').optional().nullable(),
    notes: z.string().min(3, 'Keterangan/alasan koreksi manual wajib diisi minimal 3 karakter')
  })
});

const manualUpdateSchema = z.object({
  body: z.object({
    check_in_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format jam masuk harus HH:mm atau HH:mm:ss'),
    check_out_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format jam pulang harus HH:mm atau HH:mm:ss').optional().nullable(),
    notes: z.string().min(3, 'Keterangan/alasan koreksi manual wajib diisi minimal 3 karakter')
  })
});

module.exports = {
  checkInSchema,
  checkOutSchema,
  manualCreateSchema,
  manualUpdateSchema
};
