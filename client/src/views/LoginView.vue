<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm space-y-8 animate-fade-in-up">

      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
          LB
        </div>
        <h1 class="text-2xl font-bold text-white">Masuk ke LogBook</h1>
        <p class="text-sm text-slate-500">Dashboard administrasi presensi</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="glass-card p-6 space-y-5">
        <!-- Session Expired Alert -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="isSessionExpired"
               class="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs shadow-lg shadow-amber-500/5">
            <svg class="w-5 h-5 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="font-semibold text-amber-200">Sesi Telah Berakhir</p>
              <p class="text-amber-400/90 mt-0.5">Sesi Anda telah kedaluwarsa demi keamanan. Silakan masuk kembali dengan akun Anda.</p>
            </div>
          </div>
        </transition>

        <!-- Error Message -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="errorMessage"
               class="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ errorMessage }}
          </div>
        </transition>

        <!-- Email -->
        <div class="space-y-1.5">
          <label for="email" class="block text-xs font-medium text-slate-400">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@epres.local"
            class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all duration-200"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <label for="password" class="block text-xs font-medium text-slate-400">Password</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 pr-10 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all duration-200"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
        >
          <svg v-if="authStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ authStore.loading ? 'Memproses...' : 'Masuk' }}</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-[11px] text-slate-600">
        Default: admin@epres.local / Password123!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toastStore = useToastStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

const isSessionExpired = computed(() => route.query.expired === '1' || route.query.expired === 'true');

const handleLogin = async () => {
  errorMessage.value = '';
  const result = await authStore.login(email.value, password.value);

  if (result.success) {
    toastStore.success(`Selamat datang, ${result.data.user.name}!`);
    const redirect = route.query.redirect || '/dashboard';
    router.push(redirect);
  } else {
    errorMessage.value = result.message;
  }
};
</script>
