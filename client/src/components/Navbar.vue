<template>
  <header class="sticky top-0 z-40 border-b border-white/[0.04] bg-[#0a0e1a]/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold font-mono text-sm shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            LB
          </div>
          <div class="hidden sm:block">
            <span class="font-bold text-white text-sm tracking-tight">LogBook</span>
            <span class="text-[10px] font-medium text-slate-500 ml-1.5 bg-slate-800/60 px-1.5 py-0.5 rounded-md border border-slate-700/30">
              v1.0
            </span>
          </div>
        </router-link>

        <!-- Center: Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link
            to="/"
            class="nav-link"
            :class="$route.name === 'landing' ? 'nav-link-active' : ''"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Presensi
          </router-link>

          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/dashboard"
              class="nav-link"
              :class="$route.name === 'dashboard-summary' ? 'nav-link-active' : ''"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Ringkasan
            </router-link>
            <router-link
              to="/dashboard/attendances"
              class="nav-link"
              :class="$route.name === 'dashboard-attendances' ? 'nav-link-active' : ''"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Data
            </router-link>
            <router-link
              to="/dashboard/settings"
              class="nav-link"
              :class="$route.name === 'dashboard-settings' ? 'nav-link-active' : ''"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Pengaturan
            </router-link>
          </template>
        </nav>

        <!-- Right: Auth & Theme -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- PWA Install Button -->
          <button
            v-if="pwaStore.installPrompt && !pwaStore.isInstalled"
            type="button"
            @click="pwaStore.triggerInstall"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            title="Install LogBook ke Layar Utama / Desktop"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="hidden sm:inline">Install App</span>
          </button>

          <!-- Theme Switcher -->
          <button
            type="button"
            @click="themeStore.toggleTheme"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-slate-700/30 transition-all duration-200"
            :title="themeStore.isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'"
            aria-label="Toggle Theme"
          >
            <!-- Sun icon when dark (click for light) -->
            <svg v-if="themeStore.isDark" class="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon when light (click for dark) -->
            <svg v-else class="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <template v-if="authStore.isAuthenticated">
            <div class="hidden sm:flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 pl-2 pr-3 py-1.5 rounded-full text-xs">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                {{ (authStore.user?.name || 'T').charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium text-slate-300">{{ authStore.user?.name || 'Tyas Nur Taufiq' }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></span>
            </div>
            <button
              @click="handleLogout"
              class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
            >
              Keluar
            </button>
          </template>

          <template v-else>
            <router-link
              to="/login"
              class="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              Masuk
            </router-link>
          </template>

          <!-- Mobile Menu -->
          <button
            @click="mobileOpen = !mobileOpen"
            class="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="mobileOpen" class="md:hidden border-t border-white/[0.04] bg-[#0c1020]/95 backdrop-blur-xl px-4 py-3 space-y-1">
        <router-link to="/" @click="mobileOpen = false" class="mobile-nav-link">
          Presensi
        </router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/dashboard" @click="mobileOpen = false" class="mobile-nav-link">
            Ringkasan
          </router-link>
          <router-link to="/dashboard/attendances" @click="mobileOpen = false" class="mobile-nav-link">
            Data Presensi
          </router-link>
          <router-link to="/dashboard/settings" @click="mobileOpen = false" class="mobile-nav-link">
            Pengaturan
          </router-link>
        </template>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';
import { useThemeStore } from '../stores/theme.store';
import { usePwaStore } from '../stores/pwa.store';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const themeStore = useThemeStore();
const pwaStore = usePwaStore();
const mobileOpen = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  mobileOpen.value = false;
  toastStore.info('Anda telah keluar dari sesi admin');
  router.push('/login');
};
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium
         text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]
         transition-all duration-200;
}

.nav-link-active {
  @apply text-white bg-white/[0.08] shadow-sm;
}

html:not(.dark) .nav-link {
  color: #64748b;
}
html:not(.dark) .nav-link:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}
html:not(.dark) .nav-link-active {
  color: #4f46e5 !important;
  background-color: #eef2ff !important;
}

.mobile-nav-link {
  @apply block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors;
}

html:not(.dark) .mobile-nav-link {
  color: #475569;
}
html:not(.dark) .mobile-nav-link:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}
</style>
