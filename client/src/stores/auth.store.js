import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('epres_user') || 'null'));
  const token = ref(localStorage.getItem('epres_access_token') || null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  const login = async (email, password) => {
    loading.value = true;
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = response.data.data;

      user.value = userData;
      token.value = accessToken;

      localStorage.setItem('epres_user', JSON.stringify(userData));
      localStorage.setItem('epres_access_token', accessToken);

      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Login gagal, periksa email & password Anda';
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('epres_user');
      localStorage.removeItem('epres_access_token');
    }
  };

  const checkAuth = async () => {
    if (!token.value) return false;
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.data.user;
      localStorage.setItem('epres_user', JSON.stringify(user.value));
      return true;
    } catch {
      await logout();
      return false;
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth
  };
});
