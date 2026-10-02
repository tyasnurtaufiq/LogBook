<template>
  <div class="py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">

    <!-- Row 1: Clock + Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in-up">
      <!-- Clock Widget -->
      <div class="lg:col-span-5">
        <ClockWidget />
      </div>

      <!-- Quick Stats -->
      <div class="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Hari Hadir"
          :value="`${summaryStats.totalDaysPresent || 0}`"
          subtext="Bulan berjalan"
          iconBgClass="bg-emerald-500/10"
        >
          <template #icon>
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </template>
        </StatCard>

        <StatCard
          title="Terlambat"
          :value="`${summaryStats.totalLateCount || 0}x`"
          :subtext="`${summaryStats.totalLateMinutes || 0} menit`"
          iconBgClass="bg-rose-500/10"
        >
          <template #icon>
            <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </template>
        </StatCard>

        <StatCard
          title="Lembur"
          :value="formatOvertimeHours(summaryStats.totalOvertimeMinutes || 0)"
          subtext="Total akumulasi"
          iconBgClass="bg-indigo-500/10"
        >
          <template #icon>
            <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </template>
        </StatCard>

        <StatCard
          title="Rata-rata Masuk"
          :value="summaryStats.avgCheckInTime || '--:--'"
          subtext="WIB"
          iconBgClass="bg-sky-500/10"
        >
          <template #icon>
            <svg class="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </template>
        </StatCard>
      </div>
    </div>

    <!-- Row 2: Main Action Card + Detail Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in-up-delay-1">

      <!-- LEFT: Action Panel -->
      <div class="lg:col-span-5 space-y-4">

        <!-- Employee Profile -->
        <div class="glass-card p-5">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0">
              {{ ((attendanceStore.overview?.user_name || 'Tyas Nur Taufiq').charAt(0)).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-white truncate">
                  {{ attendanceStore.overview?.user_name || attendanceStore.overview?.company_info?.employee_name || 'Tyas Nur Taufiq' }}
                </h2>
                <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                  Aktif
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ attendanceStore.overview?.company_info?.department || 'IT Support' }}
                <span v-if="attendanceStore.overview?.company_info?.employee_nip && attendanceStore.overview?.company_info?.employee_nip !== '-'">
                  • NIK: {{ attendanceStore.overview.company_info.employee_nip }}
                </span>
              </p>
              <p class="text-[11px] text-slate-400">
                {{ attendanceStore.overview?.company_info?.company_name || 'CV. Albisjogja' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Attendance Actions -->
        <div class="glass-card p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi Kehadiran</h3>
            <span class="text-[11px] text-indigo-400 font-mono font-medium">{{ todayDateFormatted }}</span>
          </div>

          <!-- Notes -->
          <input
            v-model="notes"
            type="text"
            placeholder="Catatan opsional..."
            class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all duration-200"
          />

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="handleCheckIn"
              :disabled="!attendanceStore.overview?.can_check_in || attendanceStore.actionLoading || isLocating"
              class="relative py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
              :class="attendanceStore.overview?.can_check_in && !isLocating
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.97]'
                : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-700/30'"
            >
              <svg v-if="isLocating && activeAction === 'in'" class="w-4.5 h-4.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              <span>{{ isLocating && activeAction === 'in' ? 'Mendeteksi GPS...' : (attendanceStore.overview?.can_check_in ? 'Absen Datang' : 'Sudah Masuk') }}</span>
            </button>

            <button
              @click="handleCheckOut"
              :disabled="!attendanceStore.overview?.can_check_out || attendanceStore.actionLoading || isLocating"
              class="relative py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
              :class="attendanceStore.overview?.can_check_out && !isLocating
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-[0.97]'
                : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-700/30'"
            >
              <svg v-if="isLocating && activeAction === 'out'" class="w-4.5 h-4.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span>{{ isLocating && activeAction === 'out' ? 'Mendeteksi GPS...' : (attendanceStore.overview?.can_check_out ? 'Absen Pulang' : 'Sudah Pulang') }}</span>
            </button>
          </div>

          <!-- Geofence Warning -->
          <div v-if="attendanceStore.overview?.location_config?.enabled"
               class="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Geofence aktif: <strong>{{ attendanceStore.overview.location_config.name || 'Lokasi Kantor' }}</strong> (Radius {{ attendanceStore.overview.location_config.radius_meters }}m)</span>
          </div>
        </div>

        <!-- Confirmation Alert -->
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
        >
          <div
            v-if="confirmation"
            class="glass-card p-4 border-l-2"
            :class="confirmation.action === 'CHECK_IN' ? 'border-l-emerald-500 glow-emerald' : 'border-l-indigo-500 glow-blue'"
          >
            <div class="flex items-start justify-between">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-white flex items-center gap-1.5">
                  <svg class="w-4 h-4" :class="confirmation.action === 'CHECK_IN' ? 'text-emerald-400' : 'text-indigo-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ confirmation.message }}
                </p>
                <p class="text-xs text-slate-400">
                  Tercatat pukul <span class="font-mono font-semibold text-slate-300">{{ confirmation.recorded_time }} WIB</span>
                </p>
                <p v-if="confirmation.overtime_minutes > 0" class="text-xs text-amber-400 font-semibold">
                  Lembur: {{ confirmation.overtime_formatted }}
                </p>
              </div>
              <button @click="confirmation = null" class="text-slate-600 hover:text-slate-400 p-0.5 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- RIGHT: Attendance Table + Detail -->
      <div class="lg:col-span-7 glass-card overflow-hidden flex flex-col min-h-[480px]">
        <!-- Table Header/Toolbar -->
        <div class="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-white">Riwayat Presensi</h3>
            <span class="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full font-mono">
              {{ filteredAttendances.length }} catatan
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Tab Filters -->
            <div class="flex items-center bg-slate-800/40 border border-slate-700/30 rounded-lg p-0.5 text-[11px]">
              <button
                v-for="tab in filterTabs"
                :key="tab.id"
                @click="currentTab = tab.id"
                class="px-2.5 py-1 rounded-md font-medium transition-all duration-200"
                :class="currentTab === tab.id
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'"
              >
                {{ tab.label }}
              </button>
            </div>

            <button @click="refreshData" class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.04] transition-colors" title="Refresh">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="flex-1 overflow-auto">
          <table class="w-full text-xs">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#0d1224]/95 border-b border-white/[0.04]">
                <th class="py-2.5 px-4 text-left font-medium text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                <th class="py-2.5 px-4 text-left font-medium text-slate-500 uppercase tracking-wider text-[10px]">Tanggal</th>
                <th class="py-2.5 px-4 text-left font-medium text-slate-500 uppercase tracking-wider text-[10px]">Masuk</th>
                <th class="py-2.5 px-4 text-left font-medium text-slate-500 uppercase tracking-wider text-[10px]">Pulang</th>
                <th class="py-2.5 px-4 text-left font-medium text-slate-500 uppercase tracking-wider text-[10px]">Lembur</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredAttendances"
                :key="row.id"
                @click="selectedRecord = row"
                class="border-b border-white/[0.02] cursor-pointer transition-all duration-150"
                :class="selectedRecord?.id === row.id ? 'bg-indigo-500/[0.06]' : 'hover:bg-white/[0.02]'"
              >
                <td class="py-2.5 px-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="getStatusBadgeClass(row.status)">
                    {{ formatStatusLabel(row.status) }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-300 whitespace-nowrap">{{ formatDateShort(row.work_date) }}</td>
                <td class="py-2.5 px-4 font-mono text-emerald-400 font-medium">{{ formatTime(row.check_in_at) }}</td>
                <td class="py-2.5 px-4 font-mono text-rose-400 font-medium">{{ formatTime(row.check_out_at) }}</td>
                <td class="py-2.5 px-4 font-mono text-amber-400/80">
                  {{ row.overtime_minutes > 0 ? `${row.overtime_minutes}m` : '—' }}
                </td>
              </tr>

              <tr v-if="filteredAttendances.length === 0">
                <td colspan="5" class="py-16 text-center">
                  <div class="text-slate-600 space-y-2">
                    <svg class="w-8 h-8 mx-auto text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <p class="text-xs">Belum ada catatan presensi</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bottom Bar with Detail + Quick Actions -->
        <div class="border-t border-white/[0.04] px-5 py-3 flex items-center justify-between">
          <div class="flex items-center gap-4 text-[11px] text-slate-500">
            <template v-if="selectedRecord">
              <span>
                <span class="text-slate-400 font-medium">{{ formatDateShort(selectedRecord.work_date) }}</span>
                &nbsp;·&nbsp;
                <span class="font-mono text-emerald-400/80">{{ formatTime(selectedRecord.check_in_at) }}</span>
                →
                <span class="font-mono text-rose-400/80">{{ formatTime(selectedRecord.check_out_at) }}</span>
                &nbsp;·&nbsp;
                <span class="text-slate-400">{{ calculateDuration(selectedRecord.check_in_at, selectedRecord.check_out_at) }}</span>
              </span>
            </template>
            <span v-else class="text-slate-600 italic">Pilih catatan untuk detail</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="downloadReport('pdf')"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-indigo-400 hover:text-white hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export PDF
            </button>
            <router-link
              to="/dashboard/attendances"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Lihat Semua
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { DateTime } from 'luxon';
import ClockWidget from '../components/ClockWidget.vue';
import StatCard from '../components/StatCard.vue';
import { useAttendanceStore } from '../stores/attendance.store';
import { useToastStore } from '../stores/toast.store';
import api from '../services/api';
import { downloadReportFile } from '../utils/download';

const attendanceStore = useAttendanceStore();
const toastStore = useToastStore();

const currentTab = ref('all');
const notes = ref('');
const confirmation = ref(null);
const allAttendances = ref([]);
const selectedRecord = ref(null);

const summaryStats = ref({
  totalDaysPresent: 0,
  totalLateCount: 0,
  totalLateMinutes: 0,
  totalOvertimeMinutes: 0,
  avgCheckInTime: '--:--',
  avgCheckOutTime: '--:--'
});

const filterTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'late', label: 'Terlambat' },
  { id: 'overtime', label: 'Lembur' }
];

const todayDateFormatted = computed(() => {
  return DateTime.now().setZone('Asia/Jakarta').setLocale('id').toFormat('dd MMM yyyy');
});

const fetchAllRecords = async () => {
  try {
    const res = await api.get('/attendance/list', { params: { limit: 50, sortBy: 'work_date', sortOrder: 'desc' } });
    allAttendances.value = res.data.data.data || [];
    if (!selectedRecord.value && allAttendances.value.length > 0) {
      selectedRecord.value = allAttendances.value[0];
    }
  } catch (err) {
    console.error('Failed to fetch list:', err);
  }
};

const fetchStats = async () => {
  try {
    const res = await api.get('/attendance/stats');
    summaryStats.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
};

const filteredAttendances = computed(() => {
  let list = allAttendances.value;
  if (currentTab.value === 'late') {
    list = list.filter((r) => r.status === 'TERLAMBAT' || r.late_minutes > 0);
  } else if (currentTab.value === 'overtime') {
    list = list.filter((r) => r.overtime_minutes > 0 || r.status === 'LEMBUR');
  }
  return list;
});

const isLocating = ref(false);
const activeAction = ref(null); // 'in' or 'out'

const getCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser Anda tidak mendukung fitur Geolocation / GPS.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        });
      },
      (err) => {
        let msg = 'Gagal mengakses GPS: ';
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            msg = 'Izin akses lokasi (GPS) belum diizinkan oleh browser. Silakan klik ikon gembok / perizinan di sebelah kiri URL browser Anda dan ubah status "Lokasi" menjadi "Izinkan" (Allow).';
            break;
          case 2: // POSITION_UNAVAILABLE
            msg = 'Sinyal lokasi / GPS perangkat tidak dapat dideteksi. Pastikan fitur Lokasi di Windows/perangkat Anda sudah dinyalakan.';
            break;
          case 3: // TIMEOUT
            msg = 'Waktu permintaan lokasi GPS habis (timeout). Silakan coba klik tombol absen kembali.';
            break;
          default:
            msg += err.message;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

const handleCheckIn = async () => {
  const isGeofenceEnabled = Boolean(attendanceStore.overview?.location_config?.enabled);
  let coords = { lat: null, lng: null };

  if (isGeofenceEnabled) {
    isLocating.value = true;
    activeAction.value = 'in';
    try {
      coords = await getCoordinates();
    } catch (err) {
      isLocating.value = false;
      activeAction.value = null;
      toastStore.error(err.message);
      return;
    } finally {
      isLocating.value = false;
      activeAction.value = null;
    }
  } else {
    // Geofence opsional/nonaktif: coba baca posisi jika sudah diizinkan tanpa memblokir
    try {
      if (navigator.geolocation) {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: Number(p.coords.latitude.toFixed(6)), lng: Number(p.coords.longitude.toFixed(6)) }),
            () => resolve({ lat: null, lng: null }),
            { timeout: 3000, maximumAge: 60000 }
          );
        });
      }
    } catch (_) {}
  }

  const res = await attendanceStore.checkIn({
    lat: coords.lat,
    lng: coords.lng,
    notes: notes.value.trim() || null
  });

  if (res.success) {
    confirmation.value = res.data.confirmation;
    toastStore.success(res.data.confirmation.message);
    notes.value = '';
    await refreshData();
  } else {
    toastStore.error(res.message);
  }
};

const handleCheckOut = async () => {
  const isGeofenceEnabled = Boolean(attendanceStore.overview?.location_config?.enabled);
  let coords = { lat: null, lng: null };

  if (isGeofenceEnabled) {
    isLocating.value = true;
    activeAction.value = 'out';
    try {
      coords = await getCoordinates();
    } catch (err) {
      isLocating.value = false;
      activeAction.value = null;
      toastStore.error(err.message);
      return;
    } finally {
      isLocating.value = false;
      activeAction.value = null;
    }
  } else {
    try {
      if (navigator.geolocation) {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: Number(p.coords.latitude.toFixed(6)), lng: Number(p.coords.longitude.toFixed(6)) }),
            () => resolve({ lat: null, lng: null }),
            { timeout: 3000, maximumAge: 60000 }
          );
        });
      }
    } catch (_) {}
  }

  const res = await attendanceStore.checkOut({
    lat: coords.lat,
    lng: coords.lng,
    notes: notes.value.trim() || null
  });

  if (res.success) {
    confirmation.value = res.data.confirmation;
    toastStore.success(res.data.confirmation.message);
    notes.value = '';
    await refreshData();
  } else {
    toastStore.error(res.message);
  }
};

const refreshData = async () => {
  await Promise.all([attendanceStore.fetchOverview(), fetchAllRecords(), fetchStats()]);
};

const downloadReport = async (type) => {
  try {
    const result = await downloadReportFile(`/reports/${type}`, {}, type);
    toastStore.success(`File ${result.filename} (${Math.round(result.size / 1024)} KB) berhasil diunduh!`);
  } catch (err) {
    toastStore.error(`Gagal mengunduh file ${type.toUpperCase()}: ${err.message}`);
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '—';
  return DateTime.fromISO(isoString).setZone('Asia/Jakarta').toFormat('HH:mm');
};

const formatDateRaw = (dateVal) => {
  if (!dateVal) return '';
  return typeof dateVal === 'string' ? dateVal.split('T')[0] : dateVal.toISOString().split('T')[0];
};

const formatDateShort = (dateVal) => {
  if (!dateVal) return '—';
  const str = formatDateRaw(dateVal);
  return DateTime.fromISO(str).setZone('Asia/Jakarta').setLocale('id').toFormat('EEE, dd MMM');
};

const calculateDuration = (inIso, outIso) => {
  if (!inIso || !outIso) return '—';
  const mins = Math.floor((new Date(outIso) - new Date(inIso)) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
};

const formatOvertimeHours = (minutes) => {
  if (!minutes) return '0j';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
};

const formatStatusLabel = (status) => {
  switch (status) {
    case 'TEPAT_WAKTU': return 'Tepat Waktu';
    case 'TERLAMBAT': return 'Terlambat';
    case 'PULANG_CEPAT': return 'Pulang Cepat';
    case 'LEMBUR': return 'Lembur';
    case 'HARI_LIBUR': return 'Libur';
    default: return status || '—';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'TEPAT_WAKTU': return 'badge-tepat';
    case 'TERLAMBAT': return 'badge-terlambat';
    case 'PULANG_CEPAT': return 'badge-pulang-cepat';
    case 'LEMBUR': return 'badge-lembur';
    case 'HARI_LIBUR': return 'badge-libur';
    default: return 'bg-slate-800/40 text-slate-400 border border-slate-700/30';
  }
};

onMounted(() => {
  refreshData();
});
</script>
