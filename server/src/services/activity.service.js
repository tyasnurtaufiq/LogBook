const db = require('../config/database');
const ActivityRepository = require('../repositories/activity.repository');
const UserRepository = require('../repositories/user.repository');
const AuditLogRepository = require('../repositories/auditLog.repository');
const { getNow, formatDate } = require('../utils/time');

class ActivityService {
  static async getTargetUser(userId) {
    if (userId) {
      return UserRepository.findById(userId);
    }
    const admin = await UserRepository.getFirstAdmin();
    if (!admin) {
      throw new Error('Pengguna sistem belum terdaftar');
    }
    return admin;
  }

  static async getActivities(userId, params = {}) {
    const user = await this.getTargetUser(userId);
    return ActivityRepository.findPaginated({
      userId: user.id,
      ...params
    });
  }

  static async getTodayActivities(userId) {
    const user = await this.getTargetUser(userId);
    const todayStr = formatDate(getNow());
    return ActivityRepository.findTodayActivities(user.id, todayStr);
  }

  static async getActivityById(id, userId = null) {
    const activity = await ActivityRepository.findById(id);
    if (!activity) {
      const err = new Error('Data kegiatan tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    if (userId && activity.user_id !== userId) {
      // If user is not admin, or trying to access another user's activity
      const user = await UserRepository.findById(userId);
      if (user && user.role !== 'admin') {
        const err = new Error('Anda tidak memiliki akses ke data kegiatan ini');
        err.statusCode = 403;
        throw err;
      }
    }
    return activity;
  }

  static async createActivity({ userId = null, data, ipAddress = null }) {
    const user = await this.getTargetUser(userId);
    const todayStr = formatDate(getNow());

    const activityDate = data.activity_date || todayStr;

    return db.transaction(async (trx) => {
      const created = await ActivityRepository.create(
        {
          user_id: user.id,
          activity_date: activityDate,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          title: data.title.trim(),
          location: data.location ? data.location.trim() : null,
          description: data.description ? data.description.trim() : null,
          output: data.output ? data.output.trim() : null,
          status: data.status || 'SELESAI',
          notes: data.notes ? data.notes.trim() : null
        },
        trx
      );

      await AuditLogRepository.create(
        {
          userId: user.id,
          action: 'ACTIVITY_CREATE',
          entity: 'ACTIVITY',
          entityId: created.id,
          oldValues: null,
          newValues: created,
          ipAddress
        },
        trx
      );

      return created;
    });
  }

  static async updateActivity({ id, userId = null, data, ipAddress = null }) {
    const existing = await this.getActivityById(id, userId);

    return db.transaction(async (trx) => {
      const updatePayload = {
        title: data.title !== undefined ? data.title.trim() : existing.title,
        status: data.status !== undefined ? data.status : existing.status
      };

      if (data.activity_date !== undefined) updatePayload.activity_date = data.activity_date;
      if (data.start_time !== undefined) updatePayload.start_time = data.start_time || null;
      if (data.end_time !== undefined) updatePayload.end_time = data.end_time || null;
      if (data.location !== undefined) updatePayload.location = data.location ? data.location.trim() : null;
      if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;
      if (data.output !== undefined) updatePayload.output = data.output ? data.output.trim() : null;
      if (data.notes !== undefined) updatePayload.notes = data.notes ? data.notes.trim() : null;

      const updated = await ActivityRepository.update(id, updatePayload, trx);

      await AuditLogRepository.create(
        {
          userId: userId || existing.user_id,
          action: 'ACTIVITY_UPDATE',
          entity: 'ACTIVITY',
          entityId: id,
          oldValues: existing,
          newValues: updated,
          ipAddress
        },
        trx
      );

      return updated;
    });
  }

  static async deleteActivity({ id, userId = null, ipAddress = null }) {
    const existing = await this.getActivityById(id, userId);

    return db.transaction(async (trx) => {
      await ActivityRepository.delete(id, trx);

      await AuditLogRepository.create(
        {
          userId: userId || existing.user_id,
          action: 'ACTIVITY_DELETE',
          entity: 'ACTIVITY',
          entityId: id,
          oldValues: existing,
          newValues: null,
          ipAddress
        },
        trx
      );

      return true;
    });
  }

  static async getSummaryStats({ userId = null, startDate = null, endDate = null }) {
    const user = await this.getTargetUser(userId);
    return ActivityRepository.getSummaryStats({
      userId: user.id,
      startDate,
      endDate
    });
  }
}

module.exports = ActivityService;

