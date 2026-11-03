const db = require('../config/database');

class ActivityRepository {
  static async findById(id, trx = db) {
    return trx('activities').where({ id }).first();
  }

  static async findTodayActivities(userId, todayDate, limit = 10) {
    return db('activities')
      .where({ user_id: userId, activity_date: todayDate })
      .orderBy('start_time', 'asc')
      .orderBy('id', 'asc')
      .limit(limit);
  }

  static async create(data, trx = db) {
    const [created] = await trx('activities')
      .insert({
        ...data,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      })
      .returning('*');
    return created;
  }

  static async update(id, data, trx = db) {
    const [updated] = await trx('activities')
      .where({ id })
      .update({
        ...data,
        updated_at: trx.fn.now()
      })
      .returning('*');
    return updated;
  }

  static async delete(id, trx = db) {
    return trx('activities').where({ id }).del();
  }

  static async findPaginated({
    userId,
    search = '',
    startDate = null,
    endDate = null,
    status = null,
    page = 1,
    limit = 10,
    sortBy = 'activity_date',
    sortOrder = 'desc'
  }) {
    const validSortCols = ['activity_date', 'start_time', 'end_time', 'title', 'location', 'status', 'created_at'];
    const safeSortBy = validSortCols.includes(sortBy) ? sortBy : 'activity_date';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const offset = (page - 1) * limit;

    let query = db('activities').where('user_id', userId);

    if (startDate) {
      query = query.where('activity_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('activity_date', '<=', endDate);
    }
    if (status && status !== 'ALL') {
      query = query.where('status', status);
    }
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder.whereILike('title', term)
               .orWhereILike('location', term)
               .orWhereILike('description', term)
               .orWhereILike('output', term)
               .orWhereILike('notes', term)
               .orWhereRaw("to_char(activity_date, 'YYYY-MM-DD') ILIKE ?", [term]);
      });
    }

    // Count total rows
    const countQuery = query.clone().count('* as count');
    const [{ count }] = await countQuery;
    const total = Number(count);

    // Get paginated data
    const data = await query
      .clone()
      .orderBy(safeSortBy, safeSortOrder)
      .orderBy('id', safeSortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  static async findByDateRange(userId, startDate = null, endDate = null, status = null) {
    let query = db('activities').where('user_id', userId);

    if (startDate) {
      query = query.where('activity_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('activity_date', '<=', endDate);
    }
    if (status && status !== 'ALL') {
      query = query.where('status', status);
    }

    return query.orderBy('activity_date', 'asc').orderBy('start_time', 'asc').orderBy('id', 'asc');
  }

  static async getSummaryStats({ userId, startDate = null, endDate = null }) {
    let query = db('activities').where('user_id', userId);

    if (startDate) {
      query = query.where('activity_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('activity_date', '<=', endDate);
    }

    const activities = await query;

    const totalActivities = activities.length;
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;

    const distinctDates = new Set();
    const locationCounts = {};

    activities.forEach((act) => {
      const dateStr = act.activity_date instanceof Date
        ? act.activity_date.toISOString().split('T')[0]
        : String(act.activity_date);
      distinctDates.add(dateStr);

      const st = (act.status || '').toUpperCase();
      if (st === 'SELESAI') completedCount++;
      else if (st === 'PROSES' || st === 'DALAM_PROSES') inProgressCount++;
      else if (st === 'PENDING') pendingCount++;

      if (act.location) {
        locationCounts[act.location] = (locationCounts[act.location] || 0) + 1;
      }
    });

    return {
      totalActivities,
      completedCount,
      inProgressCount,
      pendingCount,
      totalActiveDays: distinctDates.size,
      topLocations: Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([loc, count]) => ({ location: loc, count }))
    };
  }
}

module.exports = ActivityRepository;

