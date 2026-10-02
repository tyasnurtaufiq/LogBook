import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAttendanceStore = defineStore('attendance', () => {
  const overview = ref(null);
  const loading = ref(false);
  const actionLoading = ref(false);
  const serverOffsetMs = ref(0);
  const lastConfirmation = ref(null);

  const fetchOverview = async () => {
    loading.value = true;
    try {
      const clientReqTime = Date.now();
      const res = await api.get('/attendance/landing-overview');
      const clientResTime = Date.now();
      const roundTrip = (clientResTime - clientReqTime) / 2;

      const data = res.data.data;
      overview.value = data;

      // Calculate server time offset: serverTimestamp - (clientTime - half round trip)
      serverOffsetMs.value = data.server_timestamp - (clientResTime - roundTrip);

      return { success: true, data };
    } catch (err) {
      console.error('Fetch overview error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal memuat data presensi'
      };
    } finally {
      loading.value = false;
    }
  };

  const checkIn = async ({ lat = null, lng = null, notes = null } = {}) => {
    actionLoading.value = true;
    try {
      const res = await api.post('/attendance/check-in', { lat, lng, notes });
      lastConfirmation.value = res.data.data.confirmation;
      await fetchOverview();
      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal melakukan Absen Datang';
      return { success: false, message: msg };
    } finally {
      actionLoading.value = false;
    }
  };

  const checkOut = async ({ lat = null, lng = null, notes = null } = {}) => {
    actionLoading.value = true;
    try {
      const res = await api.post('/attendance/check-out', { lat, lng, notes });
      lastConfirmation.value = res.data.data.confirmation;
      await fetchOverview();
      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal melakukan Absen Pulang';
      return { success: false, message: msg };
    } finally {
      actionLoading.value = false;
    }
  };

  return {
    overview,
    loading,
    actionLoading,
    serverOffsetMs,
    lastConfirmation,
    fetchOverview,
    checkIn,
    checkOut
  };
});
