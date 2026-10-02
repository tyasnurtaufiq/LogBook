const { z } = require('zod');

const updateSchedulesSchema = z.object({
  body: z.object({
    schedules: z.array(
      z.object({
        day_of_week: z.number().int().min(1).max(7),
        start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam masuk harus HH:mm'),
        end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam pulang harus HH:mm'),
        is_workday: z.boolean()
      })
    ).length(7, 'Jadwal kerja harus mencakup 7 hari')
  })
});

const updateToleranceSchema = z.object({
  body: z.object({
    minutes: z.number().int().min(0, 'Toleransi tidak boleh negatif').max(120, 'Maksimal toleransi 120 menit')
  })
});

const updateLocationSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
    name: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius_meters: z.number().min(10, 'Radius minimal 10 meter').max(50000, 'Radius maksimal 50km')
  })
});

const createHolidaySchema = z.object({
  body: z.object({
    holiday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
    name: z.string().min(2, 'Nama hari libur minimal 2 karakter')
  })
});

const updateCompanyInfoSchema = z.object({
  body: z.object({
    company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
    employee_name: z.string().min(1, 'Nama karyawan wajib diisi'),
    employee_nip: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    approver_name: z.string().optional().nullable(),
    approver_title: z.string().optional().nullable()
  })
});

module.exports = {
  updateSchedulesSchema,
  updateToleranceSchema,
  updateLocationSchema,
  createHolidaySchema,
  updateCompanyInfoSchema
};
