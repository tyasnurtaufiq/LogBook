const db = require('../config/database');

class HolidayRepository {
  static async getAll() {
    return db('holidays').orderBy('holiday_date', 'asc');
  }

  static async findByDate(date) {
    return db('holidays').where({ holiday_date: date }).first();
  }

  static async create(data, trx = db) {
    const [holiday] = await trx('holidays').insert(data).returning('*');
    return holiday;
  }

  static async update(id, data, trx = db) {
    const [holiday] = await trx('holidays').where({ id }).update(data).returning('*');
    return holiday;
  }

  static async delete(id, trx = db) {
    return trx('holidays').where({ id }).del();
  }
}

module.exports = HolidayRepository;
