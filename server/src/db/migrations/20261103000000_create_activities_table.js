/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('activities');
  if (!hasTable) {
    await knex.schema.createTable('activities', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.date('activity_date').notNullable();
      table.string('start_time', 5).nullable(); // Format HH:mm
      table.string('end_time', 5).nullable();   // Format HH:mm
      table.string('title', 255).notNullable(); // Contoh: "Penggantian connector RJ45"
      table.string('location', 150).nullable(); // Contoh: "Sub Bagian Keuangan"
      table.text('description').nullable();     // Rincian / deskripsi pekerjaan
      table.text('output').nullable();          // Hasil pekerjaan (misal: "Koneksi LAN normal")
      table.string('status', 30).notNullable().defaultTo('SELESAI'); // SELESAI, PROSES, PENDING
      table.text('notes').nullable();           // Catatan tambahan jika ada
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index(['activity_date']);
      table.index(['user_id']);
      table.index(['status']);
      table.index(['user_id', 'activity_date']);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('activities');
};

