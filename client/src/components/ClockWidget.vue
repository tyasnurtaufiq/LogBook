<template>
  <div class="glass-card p-5 sm:p-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Waktu Server • WIB
          </span>
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ formattedDate }}</p>
      </div>

      <!-- Digital Clock -->
      <div class="flex items-baseline font-mono select-none">
        <span class="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white" :key="hours + minutes">
          {{ hours }}<span class="text-indigo-500 dark:text-indigo-400">:</span>{{ minutes }}
        </span>
        <span class="text-2xl font-semibold text-slate-400 dark:text-slate-500 ml-1 digit-animate" :key="seconds">
          :{{ seconds }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { DateTime } from 'luxon';
import { useAttendanceStore } from '../stores/attendance.store';

const attendanceStore = useAttendanceStore();

const hours = ref('00');
const minutes = ref('00');
const seconds = ref('00');
const formattedDate = ref('Memuat...');
let timer = null;

const updateClock = () => {
  const syncedMillis = Date.now() + attendanceStore.serverOffsetMs;
  const dt = DateTime.fromMillis(syncedMillis).setZone('Asia/Jakarta');

  hours.value = dt.toFormat('HH');
  minutes.value = dt.toFormat('mm');
  seconds.value = dt.toFormat('ss');
  formattedDate.value = dt.setLocale('id').toFormat('EEEE, dd MMMM yyyy');
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
