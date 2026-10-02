<template>
  <div
    class="glass-card-light p-4 transition-all duration-300 hover:shadow-md dark:hover:bg-white/[0.06] group"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg" :class="iconBgClass">
        <slot name="icon">📊</slot>
      </div>
      <span
        v-if="trend"
        class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
        :class="trend === 'up' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400'"
      >
        {{ trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—' }}
      </span>
    </div>
    <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">{{ title }}</p>
    <p class="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-gradient transition-colors duration-300">
      {{ value }}
    </p>
    <p v-if="subtext" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ subtext }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtext: { type: String, default: '' },
  trend: { type: String, default: '' },
  iconBgClass: { type: String, default: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400' }
});
</script>
