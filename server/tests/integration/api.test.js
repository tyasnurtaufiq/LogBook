import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import db from '../../src/config/database';

describe('API Integration Tests (Supertest)', () => {
  let authToken = '';
  let createdActivityId = null;
  const testDate = '2026-10-26'; // Senin (hari kerja)

  beforeAll(async () => {
    // Ensure table exists for test
    const hasActivities = await db.schema.hasTable('activities');
    if (!hasActivities) {
      await db.schema.createTable('activities', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.date('activity_date').notNullable();
        table.string('start_time', 5).nullable();
        table.string('end_time', 5).nullable();
        table.string('title', 255).notNullable();
        table.string('location', 150).nullable();
        table.text('description').nullable();
        table.text('output').nullable();
        table.string('status', 30).notNullable().defaultTo('SELESAI');
        table.text('notes').nullable();
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(db.fn.now());
        table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(db.fn.now());
      });
    }

    // Clean up any test attendance & activity record for test date
    await db('attendances').where({ work_date: testDate }).del();
    await db('activities').where({ activity_date: testDate }).del();
  });

  afterAll(async () => {
    await db('attendances').where({ work_date: testDate }).del();
    if (await db.schema.hasTable('activities')) {
      await db('activities').where({ activity_date: testDate }).del();
    }
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

  it('6. GET /api/reports/pdf - Export PDF laporan presensi berfungsi dengan header yang tepat', async () => {
    const res = await request(app)
      .get('/api/reports/pdf?from=2026-09-01&to=2026-09-30')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('7. GET /api/reports/csv - Export CSV laporan presensi berfungsi dengan header yang tepat', async () => {
    const res = await request(app)
      .get('/api/reports/csv?from=2026-09-01&to=2026-09-30')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('No,Tanggal,Hari,Jam Masuk,Jam Pulang');
  });

  // ==========================================
  // ACTIVITY TESTS
  // ==========================================

  it('8. POST /api/activities - Berhasil mencatat kegiatan harian baru', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        activity_date: testDate,
        start_time: '09:00',
        end_time: '10:30',
        title: 'Penggantian connector RJ45 di sub bagian keuangan',
        location: 'Sub Bagian Keuangan',
        description: 'Kabel LAN koneksi switch lantai 2 longgar dan pin connector korosi',
        output: 'Connector berhasil diganti baru, koneksi LAN kembali stabil 1Gbps',
        status: 'SELESAI',
        notes: 'Menggunakan connector RJ45 Cat6 Belden'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Penggantian connector RJ45 di sub bagian keuangan');
    expect(res.body.data.status).toBe('SELESAI');

    createdActivityId = res.body.data.id;
  });

  it('9. GET /api/activities - Berhasil memuat daftar kegiatan harian dengan filter', async () => {
    const res = await request(app)
      .get(`/api/activities?search=RJ45&status=SELESAI`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThan(0);
    expect(res.body.data.data[0].title).toContain('RJ45');
  });

  it('10. PUT /api/activities/:id - Berhasil memperbarui data kegiatan harian', async () => {
    const res = await request(app)
      .put(`/api/activities/${createdActivityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Penggantian connector RJ45 di sub bagian keuangan (Selesai Pengujian)',
        status: 'SELESAI',
        notes: 'Pengujian ping 100 packet lancar 0% loss'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Selesai Pengujian');
  });

  it('11. GET /api/reports/activities/pdf - Export PDF laporan kegiatan harian', async () => {
    const res = await request(app)
      .get(`/api/reports/activities/pdf?from=${testDate}&to=${testDate}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('12. GET /api/reports/activities/csv - Export CSV laporan kegiatan harian', async () => {
    const res = await request(app)
      .get(`/api/reports/activities/csv?from=${testDate}&to=${testDate}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Nama Kegiatan');
    expect(res.text).toContain('RJ45');
  });

  it('13. DELETE /api/activities/:id - Berhasil menghapus kegiatan harian', async () => {
    const res = await request(app)
      .delete(`/api/activities/${createdActivityId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
