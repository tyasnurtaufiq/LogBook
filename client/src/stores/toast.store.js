import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    toasts.value.push({ id, message, type });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (msg, duration) => addToast(msg, 'success', duration);
  const error = (msg, duration) => addToast(msg, 'error', duration);
  const info = (msg, duration) => addToast(msg, 'info', duration);
  const warning = (msg, duration) => addToast(msg, 'warning', duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
});
