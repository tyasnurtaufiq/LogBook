const db = require('../config/database');

class AuditLogRepository {
  static async create({ userId, action, entity, entityId = null, oldValues = null, newValues = null, ipAddress = null }, trx = db) {
    const [log] = await trx('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity,
        entity_id: entityId ? String(entityId) : null,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        ip_address: ipAddress,
        created_at: trx.fn.now()
      })
      .returning('*');
    return log;
  }

  static async findPaginated({ page = 1, limit = 15, entity = null }) {
    const offset = (page - 1) * limit;
    let query = db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .select(
        'audit_logs.*',
        'users.name as user_name',
        'users.email as user_email'
      );

    if (entity && entity !== 'ALL') {
      query = query.where('audit_logs.entity', entity);
    }

    const countQuery = db('audit_logs');
    if (entity && entity !== 'ALL') {
      countQuery.where('entity', entity);
    }
    const [{ count }] = await countQuery.count('* as count');
    const total = Number(count);

    const data = await query
      .orderBy('audit_logs.created_at', 'desc')
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
}

module.exports = AuditLogRepository;
