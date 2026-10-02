import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = localStorage.getItem('epres_theme');
  const initialTheme = savedTheme || 'dark';

  const theme = ref(initialTheme);
  const isDark = ref(initialTheme === 'dark');

  const applyTheme = (mode) => {
    theme.value = mode;
    isDark.value = mode === 'dark';
    localStorage.setItem('epres_theme', mode);

    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  const initTheme = () => {
    applyTheme(theme.value);
  };

  return {
    theme,
    isDark,
    toggleTheme,
    applyTheme,
    initTheme
  };
});
