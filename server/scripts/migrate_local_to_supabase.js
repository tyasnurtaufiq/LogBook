const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const localConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'su' + '200497',
  database: 'epres_db'
};

const supabaseConnectionString = process.env.DATABASE_URL || 'postgresql://postgres.novlhygrbzrnclxbmzro:SuL0gBo0k2026@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function migrateData() {
  console.log('🔄 Memulai migrasi data dari Local PostgreSQL ke Supabase...');

  const localClient = new Client(localConfig);
  const supabaseClient = new Client({
    connectionString: supabaseConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await localClient.connect();
    console.log('✅ Terhubung ke Local PostgreSQL');
    await supabaseClient.connect();
    console.log('✅ Terhubung ke Supabase PostgreSQL');

    // Urutan pembersihan tabel di Supabase (child ke parent)
    const tablesToClean = [
      'audit_logs',
      'attendances',
      'holidays',
      'settings',
      'work_schedules',
      'users'
    ];

    console.log('\n🧹 Membersihkan data dummy di Supabase...');
    for (const table of tablesToClean) {
      await supabaseClient.query(`DELETE FROM "${table}"`);
      console.log(`   - Data tabel ${table} dibersihkan`);
    }

    // Urutan migrasi tabel (parent ke child)
    const tablesToMigrate = [
      'users',
      'work_schedules',
      'settings',
      'holidays',
      'attendances',
      'audit_logs'
    ];

    console.log('\n📦 Menyalin data asli dari Local ke Supabase...');
    for (const table of tablesToMigrate) {
      const { rows } = await localClient.query(`SELECT * FROM "${table}" ORDER BY id ASC`);
      console.log(`\n➡️  Tabel "${table}": Memindahkan ${rows.length} baris data...`);

      if (rows.length === 0) continue;

      // Ambil nama kolom
      const columns = Object.keys(rows[0]);
      const quotedColumns = columns.map(c => `"${c}"`).join(', ');

      for (const row of rows) {
        const values = columns.map(c => {
          const val = row[c];
          if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
            return JSON.stringify(val);
          }
          return val;
        });
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        const insertQuery = `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        await supabaseClient.query(insertQuery, values);
      }

      // Reset sequence jika kolom 'id' ada
      if (columns.includes('id')) {
        await supabaseClient.query(`
          SELECT setval(
            pg_get_serial_sequence('"${table}"', 'id'),
            COALESCE((SELECT MAX(id) FROM "${table}"), 1)
          )
        `);
        console.log(`   ✓ Sequence "${table}_id_seq" disinkronkan`);
      }
    }

    console.log('\n🎉 MIGRASI SUKSES! Verifikasi ringkasan data di Supabase:');
    for (const table of tablesToMigrate) {
      const res = await supabaseClient.query(`SELECT COUNT(*) FROM "${table}"`);
      console.log(`   - ${table}: ${res.rows[0].count} data`);
    }

  } catch (error) {
    console.error('❌ Gagal melakukan migrasi:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

migrateData();
