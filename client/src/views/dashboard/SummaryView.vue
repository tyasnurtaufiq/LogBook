<template>
  <div class="py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Ringkasan Presensi</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Statistik kehadiran, keterlambatan, dan lembur Anda.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="downloadReport('pdf')"
          :disabled="exporting"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
          title="Buka tampilan cetak & Simpan PDF"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Cetak / PDF
        </button>
        <button
          @click="downloadReport('csv')"
          :disabled="exporting"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          CSV
        </button>
      </div>
    </div>

    <!-- Period Selector -->
    <div class="glass-card p-4 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up-delay-1">
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 font-medium">Periode:</span>
        <div class="flex items-center bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/30 rounded-lg p-0.5 text-xs">
          <button
            @click="setPeriod('this_month')"
            class="px-3 py-1.5 rounded-md font-medium transition-all duration-200"
            :class="activePeriod === 'this_month' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'"
          >
            Bulan Ini
          </button>
          <button
            @click="setPeriod('last_month')"
            class="px-3 py-1.5 rounded-md font-medium transition-all duration-200"
            :class="activePeriod === 'last_month' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'"
          >
            Bulan Lalu
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <label class="text-slate-500">Dari:</label>
        <input
          v-model="startDate"
          type="date"
          class="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all [color-scheme:dark]"
          @change="fetchStats"
        />
        <label class="text-slate-500">Sampai:</label>
        <input
          v-model="endDate"
          type="date"
          class="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all [color-scheme:dark]"
          @change="fetchStats"
        />
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up-delay-2">
      <StatCard title="Hari Hadir" :value="`${stats.totalDaysPresent}`" subtext="Total presensi" iconBgClass="bg-emerald-500/10">
        <template #icon><svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></template>
      </StatCard>
      <StatCard title="Terlambat" :value="`${stats.totalLateCount}x`" :subtext="`${stats.totalLateMinutes} menit`" iconBgClass="bg-rose-500/10">
        <template #icon><svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></template>
      </StatCard>
      <StatCard title="Lembur" :value="formatOvertimeHours(stats.totalOvertimeMinutes)" :subtext="`${stats.totalOvertimeMinutes} menit`" iconBgClass="bg-indigo-500/10">
        <template #icon><svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></template>
      </StatCard>
      <StatCard title="Rata-rata Masuk" :value="stats.avgCheckInTime || '—'" :subtext="`Pulang: ${stats.avgCheckOutTime || '—'}`" iconBgClass="bg-sky-500/10">
        <template #icon><svg class="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></template>
      </StatCard>
    </div>

    <!-- Chart -->
    <div class="glass-card p-6 space-y-4 animate-fade-in-up-delay-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-white">Pola Jam Kerja Harian</h2>
          <p class="text-[11px] text-slate-500 mt-0.5">Perbandingan jam masuk & pulang aktual</p>
        </div>
      </div>

      <div class="h-72 w-full relative">
        <Bar v-if="chartData.labels?.length > 0" :data="chartData" :options="chartOptions" />
        <div v-else class="h-full flex items-center justify-center">
          <p class="text-xs text-slate-600">Belum ada data pada periode ini</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { DateTime } from 'luxon';
import api from '../../services/api';
import StatCard from '../../components/StatCard.vue';
import { useToastStore } from '../../stores/toast.store';
import { useThemeStore } from '../../stores/theme.store';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const toastStore = useToastStore();
const themeStore = useThemeStore();

const activePeriod = ref('this_month');
const startDate = ref('');
const endDate = ref('');
const exporting = ref(false);

const stats = ref({
  totalDaysPresent: 0,
  totalLateCount: 0,
  totalLateMinutes: 0,
  totalOvertimeMinutes: 0,
  totalEarlyLeaveCount: 0,
  avgCheckInTime: '—',
  avgCheckOutTime: '—',
  records: []
});

const setPeriod = (period) => {
  activePeriod.value = period;
  const now = DateTime.now().setZone('Asia/Jakarta');

  if (period === 'this_month') {
    startDate.value = now.startOf('month').toFormat('yyyy-MM-dd');
    endDate.value = now.endOf('month').toFormat('yyyy-MM-dd');
  } else if (period === 'last_month') {
    const lastMonth = now.minus({ months: 1 });
    startDate.value = lastMonth.startOf('month').toFormat('yyyy-MM-dd');
    endDate.value = lastMonth.endOf('month').toFormat('yyyy-MM-dd');
  }

  fetchStats();
};

const fetchStats = async () => {
  try {
    const res = await api.get('/attendance/stats', {
      params: { startDate: startDate.value, endDate: endDate.value }
    });
    stats.value = res.data.data;
  } catch (err) {
    toastStore.error('Gagal memuat statistik: ' + (err.response?.data?.message || err.message));
  }
};

const formatOvertimeHours = (minutes) => {
  if (!minutes) return '0j';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
};

const chartData = computed(() => {
  const records = stats.value.records || [];
  const labels = records.map((r) => {
    const dt = DateTime.fromISO(typeof r.work_date === 'string' ? r.work_date.split('T')[0] : r.work_date.toISOString().split('T')[0]);
    return dt.toFormat('dd/MM');
  });

  const checkInData = records.map((r) => {
    if (!r.check_in_at) return 0;
    const dt = DateTime.fromISO(r.check_in_at).setZone('Asia/Jakarta');
    return Number((dt.hour + dt.minute / 60).toFixed(2));
  });

  const checkOutData = records.map((r) => {
    if (!r.check_out_at) return 0;
    const dt = DateTime.fromISO(r.check_out_at).setZone('Asia/Jakarta');
    return Number((dt.hour + dt.minute / 60).toFixed(2));
  });

  return {
    labels,
    datasets: [
      {
        label: 'Jam Masuk',
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 0.8)',
        borderWidth: 1,
        borderRadius: 6,
        data: checkInData
      },
      {
        label: 'Jam Pulang',
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        borderRadius: 6,
        data: checkOutData
      }
    ]
  };
});

const chartOptions = computed(() => {
  const isDark = themeStore.isDark;
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#94a3b8' : '#475569',
          font: { size: 11, family: 'Inter', weight: '500' },
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(226, 232, 240, 0.9)',
        borderWidth: 1,
        titleColor: isDark ? '#e2e8f0' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const val = context.raw;
            const h = Math.floor(val);
            const m = Math.round((val - h) * 60);
            return `${context.dataset.label}: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} WIB`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(148, 163, 184, 0.06)' : 'rgba(226, 232, 240, 0.8)' },
        ticks: { color: isDark ? '#64748b' : '#64748b', font: { size: 10, family: 'JetBrains Mono' } }
      },
      y: {
        min: 6,
        max: 20,
        grid: { color: isDark ? 'rgba(148, 163, 184, 0.06)' : 'rgba(226, 232, 240, 0.8)' },
        ticks: {
          color: isDark ? '#64748b' : '#64748b',
          font: { size: 10, family: 'JetBrains Mono' },
          callback: function (val) { return `${val}:00`; }
        }
      }
    }
  };
});

import { downloadReportFile, openReportPrint } from '../../utils/download';

const downloadReport = async (type) => {
  if (type === 'pdf') {
    const params = {};
    if (startDate.value) params.from = startDate.value;
    if (endDate.value) params.to = endDate.value;
    try {
      await openReportPrint(params);
      toastStore.info('Membuka tampilan cetak & Simpan PDF...');
    } catch (err) {
      toastStore.error(err.message || 'Sesi Anda telah berakhir.');
    }
    return;
  }

  exporting.value = true;
  try {
    const params = {};
    if (startDate.value) params.from = startDate.value;
    if (endDate.value) params.to = endDate.value;

    const result = await downloadReportFile(`/reports/${type}`, params, type);
    toastStore.success(`File ${result.filename} (${Math.round(result.size / 1024)} KB) berhasil diunduh!`);
  } catch (err) {
    toastStore.error(`Gagal mengunduh ${type.toUpperCase()}: ${err.message}`);
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  setPeriod('this_month');
});
</script>
