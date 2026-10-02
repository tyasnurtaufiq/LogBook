/**
 * Generate dummy attendance data from January to September 2026
 * 
 * Rules requested by user:
 * - Periode: 1 Januari 2026 s/d 30 September 2026
 * - Tidak pernah terlambat (selalu berangkat/check-in antara 06:45 - 07:30 WIB)
 * - Tidak pernah pulang sebelum jam pulang (Senin-Kamis >= 16:00, Jumat >= 14:30)
 * - Sesuaikan dengan Hari Libur Nasional & Cuti Bersama (skip semua tanggal libur & cuti bersama di tabel holidays)
 * - Weekend (Sabtu & Minggu) libur (skip)
 */

const db = require('../src/config/database');
const { DateTime } = require('luxon');

const ZONE = 'Asia/Jakarta';

// Schedule for Mon(1) - Fri(5)
const SCHEDULES = {
  1: { start: '07:30', end: '16:00', isWorkday: true },
  2: { start: '07:30', end: '16:00', isWorkday: true },
  3: { start: '07:30', end: '16:00', isWorkday: true },
  4: { start: '07:30', end: '16:00', isWorkday: true },
  5: { start: '07:30', end: '14:30', isWorkday: true },
  6: { start: '08:00', end: '12:00', isWorkday: false },
  7: { start: '08:00', end: '12:00', isWorkday: false },
};

// Base office coords (Yogyakarta)
const BASE_LAT = -7.7779;
const BASE_LNG = 110.4156;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 6) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

async function run() {
  console.log('=== MEMULAI GENERASI DATA DUMMY PRESENSI (JAN - SEP 2026) ===\n');

  // 1. Ambil data user
  const user = await db('users').first();
  if (!user) {
    throw new Error('User tidak ditemukan!');
  }
  const userId = user.id;
  console.log(`User target: ${user.name} (${user.email}), ID: ${userId}`);

  // 2. Ambil semua hari libur dari database
  const holidays = await db('holidays').select('holiday_date', 'name');
  const holidayMap = new Map();
  holidays.forEach(h => {
    const dStr = typeof h.holiday_date === 'string' 
      ? h.holiday_date.split('T')[0] 
      : DateTime.fromJSDate(h.holiday_date).setZone(ZONE).toFormat('yyyy-MM-dd');
    holidayMap.set(dStr, h.name);
  });
  console.log(`Memuat ${holidayMap.size} hari libur nasional & cuti bersama dari database.`);

  // 3. Hapus data presensi Jan - Sep 2026 yang sudah ada sebelumnya (jika ada)
  const deletedCount = await db('attendances')
    .where('user_id', userId)
    .where('work_date', '>=', '2026-01-01')
    .where('work_date', '<=', '2026-09-30')
    .del();
  console.log(`Menghapus ${deletedCount} record presensi Jan - Sep 2026 sebelumnya.`);

  // 4. Generate data harian
  const records = [];
  const skippedHolidays = [];
  const skippedWeekends = [];

  let cur = DateTime.fromISO('2026-01-01', { zone: ZONE });
  const end = DateTime.fromISO('2026-09-30', { zone: ZONE });

  while (cur <= end) {
    const dateStr = cur.toFormat('yyyy-MM-dd');
    const dow = cur.weekday; // 1=Mon .. 7=Sun
    const schedule = SCHEDULES[dow];

    // Lewati akhir pekan (Sabtu & Minggu)
    if (!schedule || !schedule.isWorkday) {
      skippedWeekends.push(dateStr);
      cur = cur.plus({ days: 1 });
      continue;
    }

    // Lewati hari libur nasional & cuti bersama
    if (holidayMap.has(dateStr)) {
      skippedHolidays.push({ date: dateStr, name: holidayMap.get(dateStr) });
      cur = cur.plus({ days: 1 });
      continue;
    }

    // Hari kerja valid!
    // Aturan Datang: Selalu antara 06:45 sampai 07:30 WIB
    // Jam 6 (menit 45-59) atau Jam 7 (menit 00-30)
    const isHour6 = Math.random() < 0.4; // 40% jam 06:xx, 60% jam 07:xx
    let inHour, inMin;
    if (isHour6) {
      inHour = 6;
      inMin = randomInt(45, 59);
    } else {
      inHour = 7;
      inMin = randomInt(0, 30);
    }
    const inSec = randomInt(0, 59);

    const checkInDt = cur.set({
      hour: inHour,
      minute: inMin,
      second: inSec,
      millisecond: 0
    });

    // Aturan Pulang: Tidak pernah pulang sebelum jam pulang
    // Senin-Kamis: Jadwal selesai 16:00
    // Jumat: Jadwal selesai 14:30
    const [schedEndHour, schedEndMin] = schedule.end.split(':').map(Number);
    const scheduledEndDt = cur.set({
      hour: schedEndHour,
      minute: schedEndMin,
      second: 0,
      millisecond: 0
    });

    // Variasi pulang:
    // ~55% tepat waktu (pulang 16:00 - 16:05 / 14:30 - 14:35, overtime 0 menit)
    // ~45% lembur (pulang 15 - 90 menit setelah jam pulang)
    const isOvertime = Math.random() < 0.45;
    let extraMinutes = 0;
    if (isOvertime) {
      // Lembur 15 s/d 90 menit
      extraMinutes = randomInt(15, 90);
    } else {
      // Tepat waktu (0 s/d 4 menit setelah bel pulang)
      extraMinutes = randomInt(0, 4);
    }

    const checkOutDt = scheduledEndDt.plus({
      minutes: extraMinutes,
      seconds: randomInt(0, 59)
    });

    // Hitung status dan overtime
    // Karena checkInDt <= 07:30:00, late_minutes = 0
    const lateMinutes = 0;
    
    // Perhitungan lembur: selisih menit checkout dari jadwal selesai
    const diffCheckoutMin = Math.floor(checkOutDt.diff(scheduledEndDt, 'minutes').minutes);
    const overtimeMinutes = diffCheckoutMin > 0 ? diffCheckoutMin : 0;

    let status = 'TEPAT_WAKTU';
    if (overtimeMinutes > 0) {
      status = 'LEMBUR';
    }

    // Variasi GPS kantor
    const checkInLat = randomFloat(BASE_LAT - 0.0003, BASE_LAT + 0.0003);
    const checkInLng = randomFloat(BASE_LNG - 0.0003, BASE_LNG + 0.0003);
    const checkOutLat = randomFloat(BASE_LAT - 0.0003, BASE_LAT + 0.0003);
    const checkOutLng = randomFloat(BASE_LNG - 0.0003, BASE_LNG + 0.0003);

    records.push({
      user_id: userId,
      work_date: dateStr,
      check_in_at: checkInDt.toJSDate(),
      check_out_at: checkOutDt.toJSDate(),
      check_in_lat: checkInLat,
      check_in_lng: checkInLng,
      check_out_lat: checkOutLat,
      check_out_lng: checkOutLng,
      status,
      late_minutes: lateMinutes,
      overtime_minutes: overtimeMinutes,
      notes: null,
      is_manual: false,
      created_at: checkInDt.toJSDate(),
      updated_at: checkOutDt.toJSDate()
    });

    cur = cur.plus({ days: 1 });
  }

  console.log(`Total hari presensi yang dihasilkan: ${records.length} hari.`);
  console.log(`Total akhir pekan dilewati: ${skippedWeekends.length} hari.`);
  console.log(`Total hari libur/cuti bersama dilewati: ${skippedHolidays.length} hari:`);
  skippedHolidays.forEach(h => {
    console.log(`  - ${h.date}: ${h.name}`);
  });

  // 5. Masukkan ke database (batch 50)
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    await db('attendances').insert(batch);
    console.log(`  Berhasil menyimpan batch ${Math.floor(i / 50) + 1} (${batch.length} baris)...`);
  }

  // 6. Ringkasan per bulan
  console.log('\n=== REKAPITULASI DATA PER BULAN ===');
  const byMonth = {};
  records.forEach(r => {
    const m = r.work_date.substring(0, 7);
    if (!byMonth[m]) {
      byMonth[m] = { total: 0, tepatWaktu: 0, lembur: 0 };
    }
    byMonth[m].total++;
    if (r.status === 'TEPAT_WAKTU') byMonth[m].tepatWaktu++;
    if (r.status === 'LEMBUR') byMonth[m].lembur++;
  });

  console.table(
    Object.entries(byMonth).map(([bulan, s]) => ({
      Bulan: bulan,
      'Total Hadir': s.total,
      'Tepat Waktu': s.tepatWaktu,
      'Lembur': s.lembur,
      'Terlambat': 0
    }))
  );

  console.log('✅ Semua data presensi dummy Jan - Sep 2026 berhasil ditambahkan ke database!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error saat menjalankan script:', err);
  process.exit(1);
});
