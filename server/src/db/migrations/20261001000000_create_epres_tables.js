/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 150).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('role', 20).notNullable().defaultTo('admin');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // 2. Work schedules table (1=Senin ... 7=Minggu)
  await knex.schema.createTable('work_schedules', (table) => {
    table.increments('id').primary();
    table.integer('day_of_week').notNullable().unique();
    table.string('start_time', 5).notNullable(); // HH:mm
    table.string('end_time', 5).notNullable();   // HH:mm
    table.boolean('is_workday').notNullable().defaultTo(true);
  });

  // 3. Settings table (JSONB for extensibility)
  await knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.string('key', 100).notNullable().unique();
    table.jsonb('value').notNullable();
    table.string('description', 255).nullable();
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // 4. Holidays table
  await knex.schema.createTable('holidays', (table) => {
    table.increments('id').primary();
    table.date('holiday_date').notNullable().unique();
    table.string('name', 150).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // 5. Attendances table
  await knex.schema.createTable('attendances', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('work_date').notNullable();
    table.timestamp('check_in_at', { useTz: true }).nullable();
    table.timestamp('check_out_at', { useTz: true }).nullable();
    table.double('check_in_lat').nullable();
    table.double('check_in_lng').nullable();
    table.double('check_out_lat').nullable();
    table.double('check_out_lng').nullable();
    table.string('status', 30).notNullable().defaultTo('TEPAT_WAKTU');
    table.integer('late_minutes').notNullable().defaultTo(0);
    table.integer('overtime_minutes').notNullable().defaultTo(0);
    table.text('notes').nullable();
    table.boolean('is_manual').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Constraints & Indexes
    table.unique(['user_id', 'work_date']);
    table.index(['work_date']);
    table.index(['user_id']);
    table.index(['status']);
  });

  // 6. Audit logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 50).notNullable();
    table.string('entity', 50).notNullable();
    table.string('entity_id', 50).nullable();
    table.jsonb('old_values').nullable();
    table.jsonb('new_values').nullable();
    table.string('ip_address', 45).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['entity', 'created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('attendances');
  await knex.schema.dropTableIfExists('holidays');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('work_schedules');
  await knex.schema.dropTableIfExists('users');
};
