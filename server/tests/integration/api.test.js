import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import db from '../../src/config/database';

describe('API Integration Tests (Supertest)', () => {
  let authToken = '';
  const testDate = '2026-10-26'; // Senin (hari kerja)

  beforeAll(async () => {
    // Clean up any test attendance record for test date
    await db('attendances').where({ work_date: testDate }).del();
  });

  afterAll(async () => {
    await db('attendances').where({ work_date: testDate }).del();
    await db.destroy();
  });

  it('1. POST /api/auth/login - Berhasil login dengan kredensial seeder', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@epres.local',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@epres.local');

    authToken = res.body.data.accessToken;
  });

  it('2. POST /api/auth/login - Gagal login dengan password salah', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@epres.local',
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('3. GET /api/attendance/landing-overview - Publik dapat mengakses overview dan jam server', async () => {
    const res = await request(app).get('/api/attendance/landing-overview');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.server_time).toBeDefined();
    expect(res.body.data.today_date).toBeDefined();
  });

  it('4. POST /api/attendance/manual - Admin dapat membuat presensi manual', async () => {
    const res = await request(app)
      .post('/api/attendance/manual')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        work_date: testDate,
        check_in_time: '07:25',
        check_out_time: '16:00',
        notes: 'Testing manual input integrasi'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('TEPAT_WAKTU');
    expect(res.body.data.is_manual).toBe(true);
  });

  it('5. POST /api/attendance/manual - Menolak duplikasi data pada tanggal yang sama (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/attendance/manual')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        work_date: testDate,
        check_in_time: '07:30',
        notes: 'Testing duplikasi presensi manual'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('6. GET /api/reports/pdf - Export PDF laporan berfungsi dengan header yang tepat', async () => {
    const res = await request(app)
      .get('/api/reports/pdf?from=2026-09-01&to=2026-09-30')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('7. GET /api/reports/csv - Export CSV laporan berfungsi dengan header yang tepat', async () => {
    const res = await request(app)
      .get('/api/reports/csv?from=2026-09-01&to=2026-09-30')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('No,Tanggal,Hari,Jam Masuk,Jam Pulang');
  });
});
