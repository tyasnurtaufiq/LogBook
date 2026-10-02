const db = require('../config/database');

class AttendanceRepository {
  static async findById(id, trx = db) {
    return trx('attendances').where({ id }).first();
  }

  static async findByUserAndDate(userId, workDate, trx = db) {
    return trx('attendances')
      .where({ user_id: userId, work_date: workDate })
      .first();
  }

  static async findLastN(userId, limit = 5) {
    return db('attendances')
      .where({ user_id: userId })
      .orderBy('work_date', 'desc')
      .limit(limit);
  }

  static async create(data, trx = db) {
    const [created] = await trx('attendances')
      .insert({
        ...data,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      })
      .returning('*');
    return created;
  }

  static async update(id, data, trx = db) {
    const [updated] = await trx('attendances')
      .where({ id })
      .update({
        ...data,
        updated_at: trx.fn.now()
      })
      .returning('*');
    return updated;
  }

  static async delete(id, trx = db) {
    return trx('attendances').where({ id }).del();
  }

  static async findPaginated({
    userId,
    search = '',
    startDate = null,
    endDate = null,
    status = null,
    page = 1,
    limit = 10,
    sortBy = 'work_date',
    sortOrder = 'desc'
  }) {
    const validSortCols = ['work_date', 'check_in_at', 'check_out_at', 'status', 'late_minutes', 'overtime_minutes'];
    const safeSortBy = validSortCols.includes(sortBy) ? sortBy : 'work_date';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const offset = (page - 1) * limit;

    let query = db('attendances').where('user_id', userId);

    if (startDate) {
      query = query.where('work_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('work_date', '<=', endDate);
    }
    if (status && status !== 'ALL') {
      query = query.where('status', status);
    }
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder.whereILike('notes', term)
               .orWhereRaw("to_char(work_date, 'YYYY-MM-DD') ILIKE ?", [term]);
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
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getSummaryStats({ userId, startDate, endDate }) {
    let query = db('attendances').where('user_id', userId);
    if (startDate) query = query.where('work_date', '>=', startDate);
    if (endDate) query = query.where('work_date', '<=', endDate);

    const attendances = await query.orderBy('work_date', 'asc');

    const totalDaysPresent = attendances.length;
    let totalLateCount = 0;
    let totalLateMinutes = 0;
    let totalOvertimeMinutes = 0;
    let totalEarlyLeaveCount = 0;
    let totalWorkMinutes = 0;
    let totalIzinDays = 0;

    let totalCheckInMinutesFromMidnight = 0;
    let checkInCount = 0;
    let totalCheckOutMinutesFromMidnight = 0;
    let checkOutCount = 0;

    attendances.forEach((att) => {
      if (att.late_minutes > 0) {
        totalLateCount++;
        totalLateMinutes += att.late_minutes;
      }
      if (att.overtime_minutes > 0) {
        totalOvertimeMinutes += att.overtime_minutes;
      }
      if (att.status === 'PULANG_CEPAT') {
        totalEarlyLeaveCount++;
      }

      // Check if this attendance is marked as Izin / Cuti / Sakit
      if (
        att.status === 'IZIN' ||
        att.status === 'CUTI' ||
        att.status === 'SAKIT' ||
        (att.notes && /izin|cuti|sakit/i.test(att.notes))
      ) {
        totalIzinDays++;
      }

      // Calculate work duration
      if (att.check_in_at && att.check_out_at) {
        const startMs = new Date(att.check_in_at).getTime();
        const endMs = new Date(att.check_out_at).getTime();
        const durationMins = Math.max(0, Math.floor((endMs - startMs) / 60000));
        totalWorkMinutes += durationMins;
      }

      if (att.check_in_at) {
        const d = new Date(att.check_in_at);
        // compute minutes in WIB (UTC+7)
        const hoursWIB = (d.getUTCHours() + 7) % 24;
        const minsWIB = d.getUTCMinutes();
        totalCheckInMinutesFromMidnight += hoursWIB * 60 + minsWIB;
        checkInCount++;
      }

      if (att.check_out_at) {
        const d = new Date(att.check_out_at);
        const hoursWIB = (d.getUTCHours() + 7) % 24;
        const minsWIB = d.getUTCMinutes();
        totalCheckOutMinutesFromMidnight += hoursWIB * 60 + minsWIB;
        checkOutCount++;
      }
    });

    const avgCheckInMin = checkInCount > 0 ? Math.round(totalCheckInMinutesFromMidnight / checkInCount) : null;
    const avgCheckOutMin = checkOutCount > 0 ? Math.round(totalCheckOutMinutesFromMidnight / checkOutCount) : null;

    const formatMinutesToHHMM = (mins) => {
      if (mins === null) return '-';
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      return `${h}:${m}`;
    };

    const workHours = Math.floor(totalWorkMinutes / 60);
    const workMins = totalWorkMinutes % 60;
    const totalWorkHoursFormatted = workHours > 0 
      ? `${workHours} Jam ${workMins > 0 ? workMins + ' Menit' : ''}`.trim() 
      : `${workMins} Menit`;

    return {
      totalDaysPresent,
      totalLateCount,
      totalLateMinutes,
      totalOvertimeMinutes,
      totalEarlyLeaveCount,
      totalWorkMinutes,
      totalWorkHoursFormatted,
      totalIzinDays,
      avgCheckInTime: formatMinutesToHHMM(avgCheckInMin),
      avgCheckOutTime: formatMinutesToHHMM(avgCheckOutMin),
      records: attendances
    };
  }

  static async findByDateRange(userId, startDate, endDate) {
    let query = db('attendances').where('user_id', userId);
    if (startDate && endDate) {
      query = query.whereBetween('work_date', [startDate, endDate]);
    } else if (startDate) {
      query = query.where('work_date', '>=', startDate);
    } else if (endDate) {
      query = query.where('work_date', '<=', endDate);
    }
    return query.orderBy('work_date', 'asc');
  }
}

module.exports = AttendanceRepository;
