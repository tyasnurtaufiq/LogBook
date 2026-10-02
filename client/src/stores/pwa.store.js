import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePwaStore = defineStore('pwa', () => {
  const installPrompt = ref(null);
  const isInstalled = ref(false);

  const initPwa = () => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      isInstalled.value = true;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installPrompt.value = e;
    });

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true;
      installPrompt.value = null;
    });
  };

  const triggerInstall = async () => {
    if (!installPrompt.value) return false;
    installPrompt.value.prompt();
    const { outcome } = await installPrompt.value.userChoice;
    if (outcome === 'accepted') {
      isInstalled.value = true;
    }
    installPrompt.value = null;
    return outcome === 'accepted';
  };

  return {
    installPrompt,
    isInstalled,
    initPwa,
    triggerInstall
  };
});
