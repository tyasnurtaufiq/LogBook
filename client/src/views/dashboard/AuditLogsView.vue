<template>
  <div class="py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Audit Log & Riwayat Aktivitas
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          Catatan riwayat perubahan data, koreksi presensi manual, dan mutasi pengaturan sistem.
        </p>
      </div>

      <button
        @click="fetchLogs(pagination.page)"
        :disabled="loading"
        class="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-slate-700/40 hover:bg-white/[0.08] text-slate-300 transition-all disabled:opacity-50"
      >
        <svg class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Muat Ulang
      </button>
    </div>

    <!-- Filter Toolbar -->
    <div class="glass-card p-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
      <div class="flex items-center gap-2.5 text-xs">
        <span class="text-slate-400 font-medium">Filter Entitas:</span>
        <select
          v-model="selectedEntity"
          @change="fetchLogs(1)"
          class="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 [color-scheme:dark]"
        >
          <option value="ALL" class="bg-slate-900 text-slate-200">Semua Entitas</option>
          <option value="ATTENDANCE" class="bg-slate-900 text-slate-200">Presensi (ATTENDANCE)</option>
          <option value="SETTING" class="bg-slate-900 text-slate-200">Pengaturan (SETTING)</option>
          <option value="WORK_SCHEDULES" class="bg-slate-900 text-slate-200">Jadwal Kerja (WORK_SCHEDULES)</option>
          <option value="HOLIDAY" class="bg-slate-900 text-slate-200">Hari Libur (HOLIDAY)</option>
        </select>
      </div>

      <div class="text-xs text-slate-400">
        Total <span class="font-bold text-white">{{ pagination.total }}</span> entri riwayat tercatat
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden animate-fade-in-up">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-white/[0.03] text-slate-300 font-semibold uppercase tracking-wider text-[11px] border-b border-white/[0.06]">
              <th class="py-3 px-4">Waktu</th>
              <th class="py-3 px-4">Aktor / Pengguna</th>
              <th class="py-3 px-4">Aksi</th>
              <th class="py-3 px-4">Entitas Terkait</th>
              <th class="py-3 px-4">Detail Mutasi</th>
              <th class="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <div class="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Memuat audit log...
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-500">
                Belum ada catatan aktivitas di audit log.
              </td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id" class="hover:bg-white/[0.02] transition-colors">
              <td class="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                {{ formatDateTime(log.created_at) }}
              </td>
              <td class="py-3 px-4">
                <div class="font-semibold text-white">{{ log.user_name || 'Sistem' }}</div>
                <div v-if="log.user_email" class="text-[10px] text-slate-500 font-normal">
                  {{ log.user_email }}
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border" :class="getActionBadgeClass(log.action)">
                  {{ log.action }}
                </span>
              </td>
              <td class="py-3 px-4 font-mono text-indigo-300 text-xs">
                {{ log.entity }} <span class="text-slate-500">#{{ log.entity_id || '-' }}</span>
              </td>
              <td class="py-3 px-4 max-w-xs">
                <button
                  v-if="log.old_values || log.new_values"
                  @click="showDetails(log)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-mono transition-colors"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Lihat JSON Diff
                </button>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">
                {{ log.ip_address || 'localhost' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
        <div>
          Halaman <strong class="text-white">{{ pagination.page }}</strong> dari <strong class="text-white">{{ pagination.totalPages || 1 }}</strong>
        </div>
        <div class="flex items-center gap-1.5 font-medium">
          <button
            @click="fetchLogs(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-slate-700/40 hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Sebelumnya
          </button>
          <span class="px-2.5 py-1 font-mono text-indigo-400 font-bold">{{ pagination.page }}</span>
          <button
            @click="fetchLogs(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-slate-700/40 hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
          >
            Selanjutnya
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal View JSON Diff -->
    <ModalDialog v-model="detailModalOpen" title="Detail Perubahan Data (Audit Log)">
      <div v-if="selectedLog" class="space-y-4 text-xs font-mono">
        <div>
          <span class="text-rose-400 font-bold flex items-center gap-1.5 mb-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Nilai Lama (Old Values):
          </span>
          <pre class="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 text-rose-300 overflow-x-auto max-h-44 text-[11px] leading-relaxed">{{ formatJson(selectedLog.old_values) }}</pre>
        </div>
        <div>
          <span class="text-emerald-400 font-bold flex items-center gap-1.5 mb-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Nilai Baru (New Values):
          </span>
          <pre class="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 text-emerald-300 overflow-x-auto max-h-44 text-[11px] leading-relaxed">{{ formatJson(selectedLog.new_values) }}</pre>
        </div>
      </div>
    </ModalDialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { DateTime } from 'luxon';
import api from '../../services/api';
import ModalDialog from '../../components/ModalDialog.vue';
import { useToastStore } from '../../stores/toast.store';

const toastStore = useToastStore();

const logs = ref([]);
const loading = ref(false);
const selectedEntity = ref('ALL');
const detailModalOpen = ref(false);
const selectedLog = ref(null);

const pagination = reactive({
  page: 1,
  limit: 15,
  total: 0,
  totalPages: 1
});

const fetchLogs = async (page = 1) => {
  loading.value = true;
  pagination.page = page;

  try {
    const res = await api.get('/settings/audit-logs', {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        entity: selectedEntity.value
      }
    });

    logs.value = res.data.data.data;
    pagination.total = res.data.data.pagination.total;
    pagination.totalPages = res.data.data.pagination.totalPages;
  } catch (err) {
    toastStore.error('Gagal memuat audit log: ' + (err.response?.data?.message || err.message));
  } finally {
    loading.value = false;
  }
};

const showDetails = (log) => {
  selectedLog.value = log;
  detailModalOpen.value = true;
};

const formatJson = (val) => {
  if (!val) return 'null';
  try {
    const obj = typeof val === 'string' ? JSON.parse(val) : val;
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(val);
  }
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  return DateTime.fromISO(iso).setZone('Asia/Jakarta').toFormat('dd/MM/yyyy HH:mm:ss');
};

const getActionBadgeClass = (action) => {
  if (action.includes('CREATE') || action.includes('CHECK_IN')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (action.includes('DELETE')) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
  if (action.includes('UPDATE') || action.includes('CHECK_OUT')) {
    return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  }
  return 'bg-slate-700/20 text-slate-400 border-slate-700/40';
};

onMounted(() => {
  fetchLogs(1);
});
</script>
