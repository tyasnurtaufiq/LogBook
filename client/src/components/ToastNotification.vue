<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-x-4"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl backdrop-blur-xl shadow-2xl border text-sm font-medium"
        :class="getToastClasses(toast.type)"
      >
        <div class="shrink-0">
          <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <svg v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <svg v-else class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="flex-1 text-slate-200 text-[13px]">{{ toast.message }}</div>
        <button
          @click="toastStore.removeToast(toast.id)"
          class="text-slate-500 hover:text-white p-0.5 rounded transition-colors shrink-0"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast.store';

const toastStore = useToastStore();

const getToastClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-[#0c1020]/95 border-emerald-500/20 shadow-emerald-950/30';
    case 'error':
      return 'bg-[#0c1020]/95 border-rose-500/20 shadow-rose-950/30';
    case 'warning':
      return 'bg-[#0c1020]/95 border-amber-500/20 shadow-amber-950/30';
    default:
      return 'bg-[#0c1020]/95 border-blue-500/20 shadow-blue-950/30';
  }
};
</script>
