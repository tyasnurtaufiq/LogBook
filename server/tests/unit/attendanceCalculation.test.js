import { describe, it, expect } from 'vitest';
import AttendanceCalculationService from '../../src/services/attendanceCalculation.service';
import { DateTime } from 'luxon';

describe('AttendanceCalculationService (Unit Tests)', () => {
  const standardSchedule = {
    day_of_week: 1, // Senin
    start_time: '07:30',
    end_time: '16:00',
    is_workday: true
  };

  const fridaySchedule = {
    day_of_week: 5, // Jumat
    start_time: '07:30',
    end_time: '14:30',
    is_workday: true
  };

  const weekendSchedule = {
    day_of_week: 6, // Sabtu
    start_time: '08:00',
    end_time: '12:00',
    is_workday: false
  };

  it('1. Kasus Tepat Waktu: Masuk 07:25 WIB, Pulang 16:00 WIB', () => {
    // 07:25 WIB is 00:25 UTC
    const checkIn = '2026-10-05T07:25:00+07:00';
    const checkOut = '2026-10-05T16:00:00+07:00';

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: standardSchedule,
      isHoliday: false,
      toleranceMinutes: 0
    });

    expect(result.status).toBe('TEPAT_WAKTU');
    expect(result.late_minutes).toBe(0);
    expect(result.overtime_minutes).toBe(0);
    expect(result.early_leave_minutes).toBe(0);
    expect(result.work_duration_minutes).toBe(515); // 8 jam 35 menit
  });

  it('2. Kasus Terlambat: Masuk 07:48 WIB (Telat 18 menit), Pulang 16:15 WIB', () => {
    const checkIn = '2026-10-05T07:48:00+07:00';
    const checkOut = '2026-10-05T16:15:00+07:00';

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: standardSchedule,
      isHoliday: false,
      toleranceMinutes: 0
    });

    expect(result.status).toBe('TERLAMBAT');
    expect(result.late_minutes).toBe(18);
    expect(result.overtime_minutes).toBe(15);
  });

  it('3. Kasus Toleransi Keterlambatan: Masuk 07:34 WIB dengan toleransi 5 menit', () => {
    const checkIn = '2026-10-05T07:34:00+07:00'; // 4 menit lewat 07:30
    const checkOut = '2026-10-05T16:00:00+07:00';

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: standardSchedule,
      isHoliday: false,
      toleranceMinutes: 5 // toleransi 5 menit
    });

    expect(result.status).toBe('TEPAT_WAKTU');
    expect(result.late_minutes).toBe(0);
  });

  it('4. Kasus Pulang Lebih Awal: Masuk 07:20 WIB, Pulang 15:30 WIB (Awal 30 menit)', () => {
    const checkIn = '2026-10-05T07:20:00+07:00';
    const checkOut = '2026-10-05T15:30:00+07:00'; // Harusnya 16:00

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: standardSchedule,
      isHoliday: false
    });

    expect(result.status).toBe('PULANG_CEPAT');
    expect(result.late_minutes).toBe(0);
    expect(result.early_leave_minutes).toBe(30);
    expect(result.overtime_minutes).toBe(0);
  });

  it('5. Kasus Lembur Hari Jumat: Pulang seharusnya 14:30 WIB, Pulang aktual 17:00 WIB', () => {
    const checkIn = '2026-10-09T07:28:00+07:00';
    const checkOut = '2026-10-09T17:00:00+07:00'; // Selisih 14:30 -> 17:00 adalah 2 jam 30 menit (150 menit)

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: fridaySchedule,
      isHoliday: false
    });

    expect(result.status).toBe('LEMBUR');
    expect(result.late_minutes).toBe(0);
    expect(result.overtime_minutes).toBe(150);
  });

  it('6. Kasus Absen di Hari Libur / Akhir Pekan: Seluruh durasi dihitung lembur', () => {
    const checkIn = '2026-10-10T08:00:00+07:00';
    const checkOut = '2026-10-10T12:30:00+07:00'; // 4 jam 30 menit = 270 menit

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: weekendSchedule,
      isHoliday: false
    });

    expect(result.status).toBe('HARI_LIBUR');
    expect(result.late_minutes).toBe(0);
    expect(result.overtime_minutes).toBe(270);
    expect(result.work_duration_minutes).toBe(270);
  });

  it('7. Kasus Tanggal Merah Nasional: Meskipun hari kerja biasa (Senin), diperlakukan sebagai hari libur', () => {
    const checkIn = '2026-08-17T08:00:00+07:00'; // HUT RI
    const checkOut = '2026-08-17T13:00:00+07:00'; // 5 jam = 300 menit

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: checkOut,
      schedule: standardSchedule,
      isHoliday: true // Hari libur nasional
    });

    expect(result.status).toBe('HARI_LIBUR');
    expect(result.late_minutes).toBe(0);
    expect(result.overtime_minutes).toBe(300);
  });

  it('8. Kasus Lupa Absen Pulang (Check-out masih null)', () => {
    const checkIn = '2026-10-05T07:20:00+07:00';

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkIn,
      checkOutAt: null,
      schedule: standardSchedule,
      isHoliday: false
    });

    expect(result.status).toBe('TEPAT_WAKTU');
    expect(result.check_out_at).toBeNull();
    expect(result.work_duration_minutes).toBe(0);
    expect(result.overtime_minutes).toBe(0);
  });

  it('9. Kasus Konversi Timezone Asia/Jakarta (WIB) dari ISO UTC String', () => {
    // 00:30 UTC = 07:30 WIB
    const checkInUtc = '2026-10-05T00:30:00.000Z';
    const checkOutUtc = '2026-10-05T09:00:00.000Z'; // 16:00 WIB

    const result = AttendanceCalculationService.calculate({
      checkInAt: checkInUtc,
      checkOutAt: checkOutUtc,
      schedule: standardSchedule,
      isHoliday: false
    });

    expect(result.work_date).toBe('2026-10-05');
    expect(result.late_minutes).toBe(0);
    expect(result.overtime_minutes).toBe(0);
  });
});
