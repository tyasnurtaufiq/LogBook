const db = require('../config/database');

class SettingRepository {
  static async getByKey(key) {
    const row = await db('settings').where({ key }).first();
    return row ? (typeof row.value === 'string' ? JSON.parse(row.value) : row.value) : null;
  }

  static async getAll() {
    const rows = await db('settings').select('*');
    const result = {};
    rows.forEach(r => {
      result[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    });
    return result;
  }

  static async upsert(key, value, description = null, trx = db) {
    const jsonValue = JSON.stringify(value);
    const existing = await trx('settings').where({ key }).first();
    if (existing) {
      await trx('settings').where({ key }).update({
        value: jsonValue,
        description: description || existing.description,
        updated_at: trx.fn.now()
      });
    } else {
      await trx('settings').insert({
        key,
        value: jsonValue,
        description,
        updated_at: trx.fn.now()
      });
    }
  }
}

module.exports = SettingRepository;
