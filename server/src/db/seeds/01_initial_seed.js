const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Truncate tables in proper order
  await knex('audit_logs').del();
  await knex('attendances').del();
  await knex('holidays').del();
  await knex('settings').del();
  await knex('work_schedules').del();
  await knex('users').del();

  // Reset auto-increment sequences
  await knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE work_schedules_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE settings_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE holidays_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE attendances_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');

  // 1. Seed User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const [adminUser] = await knex('users').insert({
    name: 'Budi Pratama',
    email: 'admin@epres.local',
    password_hash: passwordHash,
    role: 'admin'
  }).returning('*');

  // 2. Seed Work Schedules (1=Mon ... 7=Sun)
  await knex('work_schedules').insert([
    { day_of_week: 1, start_time: '07:30', end_time: '16:00', is_workday: true },
    { day_of_week: 2, start_time: '07:30', end_time: '16:00', is_workday: true },
    { day_of_week: 3, start_time: '07:30', end_time: '16:00', is_workday: true },
    { day_of_week: 4, start_time: '07:30', end_time: '16:00', is_workday: true },
    { day_of_week: 5, start_time: '07:30', end_time: '14:30', is_workday: true },
    { day_of_week: 6, start_time: '08:00', end_time: '12:00', is_workday: false },
    { day_of_week: 7, start_time: '08:00', end_time: '12:00', is_workday: false }
  ]);

  // 3. Seed Settings
  await knex('settings').insert([
    {
      key: 'late_tolerance_minutes',
      value: JSON.stringify({ minutes: 0 }),
      description: 'Toleransi keterlambatan (menit)'
    },
    {
      key: 'office_location',
      value: JSON.stringify({
        enabled: false,
        name: 'Kantor Pusat Jakarta',
        latitude: -6.2088,
        longitude: 106.8456,
        radius_meters: 100
      }),
      description: 'Pengaturan Geofencing Kantor'
    },
    {
      key: 'company_info',
      value: JSON.stringify({
        company_name: 'PT Digital Solusi Nusantara',
        employee_name: 'Budi Pratama',
        employee_nip: 'EMP-2026-0881',
        department: 'Software Engineering',
        approver_name: 'Ahmad Fauzi, M.T.',
        approver_title: 'Engineering Director'
      }),
      description: 'Informasi Karyawan & Perusahaan untuk Laporan PDF'
    }
  ]);

  // 4. Seed Holidays — Hari Libur Nasional & Cuti Bersama Tahun 2026
  await knex('holidays').insert([
    // === HARI LIBUR NASIONAL ===
    { holiday_date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
    { holiday_date: '2026-01-16', name: 'Isra Mikraj Nabi Muhammad SAW' },
    { holiday_date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
    { holiday_date: '2026-03-19', name: 'Hari Suci Nyepi Tahun Baru Saka 1948' },
    { holiday_date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 Hijriah' },
    { holiday_date: '2026-03-22', name: 'Hari Raya Idul Fitri 1447 Hijriah' },
    { holiday_date: '2026-04-03', name: 'Wafat Yesus Kristus' },
    { holiday_date: '2026-04-05', name: 'Kebangkitan Yesus Kristus (Paskah)' },
    { holiday_date: '2026-05-01', name: 'Hari Buruh Internasional' },
    { holiday_date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
    { holiday_date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 Hijriah' },
    { holiday_date: '2026-05-31', name: 'Hari Waisak 2570 BE' },
    { holiday_date: '2026-06-01', name: 'Hari Lahir Pancasila' },
    { holiday_date: '2026-06-16', name: 'Tahun Baru Islam 1448 Hijriah' },
    { holiday_date: '2026-08-17', name: 'Hari Proklamasi Kemerdekaan Republik Indonesia' },
    { holiday_date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
    { holiday_date: '2026-12-25', name: 'Hari Raya Natal / Kelahiran Yesus Kristus' },
    // === CUTI BERSAMA ===
    { holiday_date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek 2577 Kongzili' },
    { holiday_date: '2026-03-18', name: 'Cuti Bersama Hari Suci Nyepi Tahun Baru Saka 1948' },
    { holiday_date: '2026-03-20', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 Hijriah' },
    { holiday_date: '2026-03-23', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 Hijriah' },
    { holiday_date: '2026-03-24', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 Hijriah' },
    { holiday_date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
    { holiday_date: '2026-05-28', name: 'Cuti Bersama Hari Raya Idul Adha 1447 Hijriah' },
    { holiday_date: '2026-12-24', name: 'Cuti Bersama Hari Raya Natal' }
  ]);

  // 5. Seed Attendances (Contoh Data Bulan September 2026)
  // Asia/Jakarta is UTC+7 -> 07:25 WIB = 00:25 UTC, 16:15 WIB = 09:15 UTC
  const sampleAttendances = [
    {
      user_id: adminUser.id,
      work_date: '2026-09-01', // Selasa (Normal, tepat waktu)
      check_in_at: '2026-09-01T00:25:00.000Z',  // 07:25 WIB
      check_out_at: '2026-09-01T09:10:00.000Z', // 16:10 WIB (Lembur 10 mnt)
      status: 'TEPAT_WAKTU',
      late_minutes: 0,
      overtime_minutes: 10,
      notes: 'Presensi harian lancar',
      is_manual: false
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-02', // Rabu (Terlambat)
      check_in_at: '2026-09-02T00:48:00.000Z',  // 07:48 WIB (Terlambat 18 mnt)
      check_out_at: '2026-09-02T09:30:00.000Z', // 16:30 WIB (Lembur 30 mnt)
      status: 'TERLAMBAT',
      late_minutes: 18,
      overtime_minutes: 30,
      notes: 'Macet di jalan arteri',
      is_manual: false
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-03', // Kamis (Pulang cepat)
      check_in_at: '2026-09-03T00:20:00.000Z',  // 07:20 WIB
      check_out_at: '2026-09-03T08:45:00.000Z', // 15:45 WIB (Pulang awal 15 mnt)
      status: 'PULANG_CEPAT',
      late_minutes: 0,
      overtime_minutes: 0,
      notes: 'Izin kontrol dokter sore',
      is_manual: false
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-04', // Jumat (Jadwal pulang 14:30! Lembur sampai 17:00)
      check_in_at: '2026-09-04T00:28:00.000Z',  // 07:28 WIB
      check_out_at: '2026-09-04T10:00:00.000Z', // 17:00 WIB (Lembur 150 menit / 2.5 jam)
      status: 'LEMBUR',
      late_minutes: 0,
      overtime_minutes: 150,
      notes: 'Deployment rilis versi produksi',
      is_manual: false
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-05', // Sabtu (Hari libur akhir pekan, tetap masuk -> Full Lembur)
      check_in_at: '2026-09-05T01:30:00.000Z',  // 08:30 WIB
      check_out_at: '2026-09-05T06:00:00.000Z', // 13:00 WIB (4.5 jam = 270 menit lembur)
      status: 'HARI_LIBUR',
      late_minutes: 0,
      overtime_minutes: 270,
      notes: 'Maintenance server akhir pekan',
      is_manual: false
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-07', // Senin
      check_in_at: '2026-09-07T00:22:00.000Z',  // 07:22 WIB
      check_out_at: '2026-09-07T09:05:00.000Z', // 16:05 WIB (Lembur 5 mnt)
      status: 'TEPAT_WAKTU',
      late_minutes: 0,
      overtime_minutes: 5,
      notes: 'Koreksi manual karena sistem offline',
      is_manual: true
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-08', // Selasa
      check_in_at: '2026-09-08T00:29:00.000Z',  // 07:29 WIB
      check_out_at: '2026-09-08T09:00:00.000Z', // 16:00 WIB
      status: 'TEPAT_WAKTU',
      late_minutes: 0,
      overtime_minutes: 0,
      notes: null,
      is_manual: false
    },
    {
      user_id: adminUser.id,
      work_date: '2026-09-11', // Jumat
      check_in_at: '2026-09-11T00:35:00.000Z',  // 07:35 WIB (Terlambat 5 mnt)
      check_out_at: '2026-09-11T08:00:00.000Z', // 15:00 WIB (Lembur 30 mnt dari 14:30)
      status: 'TERLAMBAT',
      late_minutes: 5,
      overtime_minutes: 30,
      notes: 'Hujan deras pagi',
      is_manual: false
    }
  ];

  await knex('attendances').insert(sampleAttendances);

  // 6. Audit log initial record
  await knex('audit_logs').insert({
    user_id: adminUser.id,
    action: 'INITIAL_SEED',
    entity: 'SYSTEM',
    entity_id: '0',
    old_values: null,
    new_values: JSON.stringify({ message: 'Database initialized with seeds' }),
    ip_address: '127.0.0.1'
  });
};
