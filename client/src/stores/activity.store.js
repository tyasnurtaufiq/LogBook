import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([]);
  const todayActivities = ref([]);
  const stats = ref({
    totalActivities: 0,
    completedCount: 0,
    inProgressCount: 0,
    pendingCount: 0,
    totalActiveDays: 0,
    topLocations: []
  });
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const loading = ref(false);
  const actionLoading = ref(false);

  const fetchActivities = async (params = {}) => {
    loading.value = true;
    try {
      const res = await api.get('/activities', { params });
      if (res.data?.success) {
        activities.value = res.data.data.data;
        pagination.value = res.data.data.pagination;
      }
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error('Fetch activities error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal memuat data kegiatan harian'
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchTodayActivities = async () => {
    try {
      const res = await api.get('/activities/today');
      if (res.data?.success) {
        todayActivities.value = res.data.data;
      }
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error('Fetch today activities error:', err);
      return { success: false, message: 'Gagal memuat kegiatan hari ini' };
    }
  };

  const fetchStats = async (params = {}) => {
    try {
      const res = await api.get('/activities/stats', { params });
      if (res.data?.success) {
        stats.value = res.data.data;
      }
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error('Fetch stats error:', err);
      return { success: false, message: 'Gagal memuat statistik kegiatan' };
    }
  };

  const createActivity = async (payload) => {
    actionLoading.value = true;
    try {
      const res = await api.post('/activities', payload);
      await fetchTodayActivities();
      return { success: true, data: res.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menambahkan kegiatan';
      return { success: false, message };
    } finally {
      actionLoading.value = false;
    }
  };

  const updateActivity = async (id, payload) => {
    actionLoading.value = true;
    try {
      const res = await api.put(`/activities/${id}`, payload);
      await fetchTodayActivities();
      return { success: true, data: res.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memperbarui kegiatan';
      return { success: false, message };
    } finally {
      actionLoading.value = false;
    }
  };

  const deleteActivity = async (id) => {
    actionLoading.value = true;
    try {
      await api.delete(`/activities/${id}`);
      await fetchTodayActivities();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus kegiatan';
      return { success: false, message };
    } finally {
      actionLoading.value = false;
    }
  };

  return {
    activities,
    todayActivities,
    stats,
    pagination,
    loading,
    actionLoading,
    fetchActivities,
    fetchTodayActivities,
    fetchStats,
    createActivity,
    updateActivity,
    deleteActivity
  };
});

