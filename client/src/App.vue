<template>
  <div class="min-h-screen bg-[var(--bg-primary)] bg-mesh text-[var(--text-body)] flex flex-col font-sans transition-colors duration-200">
    <Navbar />
    <main class="flex-1 w-full">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ToastNotification />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import ToastNotification from './components/ToastNotification.vue';
import { useAuthStore } from './stores/auth.store';
import { useThemeStore } from './stores/theme.store';
import { usePwaStore } from './stores/pwa.store';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const pwaStore = usePwaStore();

onMounted(async () => {
  pwaStore.initPwa();
  themeStore.initTheme();
  if (authStore.token) {
    await authStore.checkAuth();
  }
});
</script>
