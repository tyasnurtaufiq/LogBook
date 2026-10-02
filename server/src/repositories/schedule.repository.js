const db = require('../config/database');

class ScheduleRepository {
  static async getAll() {
    return db('work_schedules').orderBy('day_of_week', 'asc');
  }

  static async findByDayOfWeek(dayOfWeek) {
    return db('work_schedules').where({ day_of_week: dayOfWeek }).first();
  }

  static async upsert(scheduleData, trx = db) {
    return trx('work_schedules')
      .insert(scheduleData)
      .onConflict('day_of_week')
      .merge();
  }

  static async updateAll(schedules, trx = db) {
    for (const s of schedules) {
      await trx('work_schedules')
        .where({ day_of_week: s.day_of_week })
        .update({
          start_time: s.start_time,
          end_time: s.end_time,
          is_workday: s.is_workday
        });
    }
  }
}

module.exports = ScheduleRepository;
