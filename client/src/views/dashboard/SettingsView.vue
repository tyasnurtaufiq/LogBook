<template>
  <div class="py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          Pengaturan Sistem
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          Konfigurasi jadwal kerja mingguan, aturan keterlambatan, geofencing lokasi, dan template PDF.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchSettings"
          :disabled="loading"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-slate-700/40 hover:bg-white/[0.08] text-slate-300 transition-all disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Muat Ulang
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="glass-card py-16 text-center text-slate-400">
      <div class="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs font-medium">Memuat konfigurasi sistem...</p>
    </div>

    <div v-else class="space-y-6">

      <!-- 1. JADWAL KERJA HARIAN -->
      <div class="glass-card p-5 sm:p-6 space-y-4 animate-fade-in-up">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              Jadwal Jam Kerja Mingguan
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Tentukan hari aktif kerja serta jam masuk dan pulang acuan perhitungan lembur.
            </p>
          </div>
          <button
            @click="saveSchedules"
            :disabled="saving"
            class="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ saving ? 'Menyimpan...' : 'Simpan Jadwal' }}
          </button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-white/[0.03] text-slate-300 font-semibold border-b border-white/[0.06]">
                <th class="py-3 px-4">Hari</th>
                <th class="py-3 px-4">Status Kerja</th>
                <th class="py-3 px-4">Jam Masuk Acuan</th>
                <th class="py-3 px-4">Jam Pulang Seharusnya</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="sch in schedules" :key="sch.day_of_week" class="hover:bg-white/[0.02] transition-colors">
                <td class="py-3 px-4 font-semibold text-white">
                  {{ getDayName(sch.day_of_week) }}
                </td>
                <td class="py-3 px-4">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="sch.is_workday" class="sr-only peer" />
                    <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span class="ml-2.5 text-xs font-semibold" :class="sch.is_workday ? 'text-emerald-400' : 'text-slate-500'">
                      {{ sch.is_workday ? 'Hari Kerja' : 'Hari Libur' }}
                    </span>
                  </label>
                </td>
                <td class="py-3 px-4">
                  <input
                    type="time"
                    v-model="sch.start_time"
                    :disabled="!sch.is_workday"
                    class="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 disabled:opacity-30 [color-scheme:dark]"
                  />
                </td>
                <td class="py-3 px-4">
                  <input
                    type="time"
                    v-model="sch.end_time"
                    :disabled="!sch.is_workday"
                    class="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 disabled:opacity-30 [color-scheme:dark]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. TOLERANSI & GEOFENCING -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Toleransi Keterlambatan -->
        <div class="glass-card p-5 sm:p-6 space-y-4">
          <div class="border-b border-white/[0.06] pb-3">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Toleransi Keterlambatan
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Batas kelonggaran menit sebelum check-in dinyatakan terlambat.
            </p>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-medium text-slate-300 mb-1.5">Toleransi Waktu (Menit)</label>
              <div class="flex items-center gap-2.5">
                <input
                  v-model.number="toleranceMinutes"
                  type="number"
                  min="0"
                  max="120"
                  class="w-28 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                />
                <span class="text-slate-400 font-medium">menit setelah jam masuk</span>
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-500">Preset:</span>
              <button
                type="button"
                v-for="preset in [0, 5, 10, 15, 30]"
                :key="preset"
                @click="toleranceMinutes = preset"
                class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                :class="toleranceMinutes === preset ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-slate-700/30'"
              >
                {{ preset }}m
              </button>
            </div>

            <div class="pt-2">
              <button
                @click="saveTolerance"
                :disabled="saving"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                Simpan Toleransi
              </button>
            </div>
          </div>
        </div>

        <!-- Geofencing Kantor -->
        <div class="glass-card p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                Geofencing Lokasi Kantor
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Validasi radius GPS saat presensi via koordinat kantor.
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="locationConfig.enabled" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          <div class="space-y-3.5 text-xs" :class="!locationConfig.enabled && 'opacity-40 pointer-events-none'">
            <div>
              <label class="block font-medium text-slate-300 mb-1">Nama Lokasi / Kantor</label>
              <input
                v-model="locationConfig.name"
                type="text"
                class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-300 mb-1">Latitude</label>
                <input
                  v-model.number="locationConfig.latitude"
                  type="number"
                  step="any"
                  class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 font-mono text-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
                />
              </div>
              <div>
                <label class="block font-medium text-slate-300 mb-1">Longitude</label>
                <input
                  v-model.number="locationConfig.longitude"
                  type="number"
                  step="any"
                  class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 font-mono text-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
                />
              </div>
            </div>

            <div class="flex items-end justify-between gap-3">
              <div>
                <label class="block font-medium text-slate-300 mb-1">Radius Izin (Meter)</label>
                <input
                  v-model.number="locationConfig.radius_meters"
                  type="number"
                  min="10"
                  max="10000"
                  class="w-32 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 font-mono text-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
                />
              </div>
              <button
                type="button"
                @click="getCurrentLocation"
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition-all"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ambil GPS Saat Ini
              </button>
            </div>

            <div class="pt-2">
              <button
                @click="saveLocation"
                :disabled="saving"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                Simpan Lokasi Kantor
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. INFORMASI PERUSAHAAN & PDF -->
      <div class="glass-card p-5 sm:p-6 space-y-4 animate-fade-in-up">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-violet-400"></span>
              Informasi Karyawan & Dokumen PDF
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Data yang dicetak pada kop surat dan kolom tanda tangan laporan presensi bulanan.
            </p>
          </div>
          <button
            @click="saveCompanyInfo"
            :disabled="saving"
            class="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Info PDF
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-medium text-slate-300 mb-1">Nama Perusahaan / Organisasi</label>
            <input
              v-model="companyInfo.company_name"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>
          <div>
            <label class="block font-medium text-slate-300 mb-1">Nama Lengkap Karyawan</label>
            <input
              v-model="companyInfo.employee_name"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>
          <div>
            <label class="block font-medium text-slate-300 mb-1">Nomor Induk Kependudukan (NIK)</label>
            <input
              v-model="companyInfo.employee_nip"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>
          <div>
            <label class="block font-medium text-slate-300 mb-1">Departemen / Divisi</label>
            <input
              v-model="companyInfo.department"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>
          <div>
            <label class="block font-medium text-slate-300 mb-1">Nama Atasan (Approver)</label>
            <input
              v-model="companyInfo.approver_name"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>
          <div>
            <label class="block font-medium text-slate-300 mb-1">Jabatan Atasan</label>
            <input
              v-model="companyInfo.approver_title"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>
        </div>
      </div>

      <!-- 4. HARI LIBUR & TANGGAL MERAH -->
      <div class="glass-card p-5 sm:p-6 space-y-4 animate-fade-in-up">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-400"></span>
              Daftar Hari Libur & Tanggal Merah
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Presensi pada tanggal merah otomatis dihitung sebagai jam lembur.
            </p>
          </div>
          <button
            @click="holidayModalOpen = true"
            class="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Hari Libur
          </button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-white/[0.03] text-slate-300 font-semibold border-b border-white/[0.06]">
                <th class="py-3 px-4">Tanggal Libur</th>
                <th class="py-3 px-4">Keterangan / Nama Acara</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-if="holidays.length === 0">
                <td colspan="3" class="py-8 text-center text-slate-500">
                  Belum ada hari libur nasional yang ditambahkan.
                </td>
              </tr>
              <tr v-else v-for="hol in holidays" :key="hol.id" class="hover:bg-white/[0.02] transition-colors">
                <td class="py-3 px-4 font-mono font-medium text-rose-400 whitespace-nowrap">
                  {{ hol.holiday_date }}
                </td>
                <td class="py-3 px-4 text-slate-200 font-medium">
                  {{ hol.name }}
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    @click="deleteHoliday(hol.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Hari Libur -->
    <ModalDialog v-model="holidayModalOpen" title="Tambah Hari Libur Nasional">
      <form @submit.prevent="saveHoliday" class="space-y-4 text-xs">
        <div>
          <label class="block font-medium text-slate-300 mb-1.5">Tanggal Libur</label>
          <input
            v-model="newHoliday.holiday_date"
            type="date"
            required
            class="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 [color-scheme:dark]"
          />
        </div>
        <div>
          <label class="block font-medium text-slate-300 mb-1.5">Keterangan / Nama Libur</label>
          <input
            v-model="newHoliday.name"
            type="text"
            required
            placeholder="Contoh: Hari Raya Idul Fitri"
            class="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
          />
        </div>

        <div class="pt-4 border-t border-white/[0.06] flex justify-end gap-2.5">
          <button
            type="button"
            @click="holidayModalOpen = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan Hari Libur' }}
          </button>
        </div>
      </form>
    </ModalDialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../../services/api';
import ModalDialog from '../../components/ModalDialog.vue';
import { useToastStore } from '../../stores/toast.store';

const toastStore = useToastStore();

const loading = ref(true);
const saving = ref(false);
const holidayModalOpen = ref(false);

const schedules = ref([]);
const toleranceMinutes = ref(0);
const locationConfig = reactive({
  enabled: false,
  name: 'Kantor',
  latitude: -6.2088,
  longitude: 106.8456,
  radius_meters: 100
});

const companyInfo = reactive({
  company_name: '',
  employee_name: '',
  employee_nip: '',
  department: '',
  approver_name: '',
  approver_title: ''
});

const holidays = ref([]);

const newHoliday = reactive({
  holiday_date: '',
  name: ''
});

const getDayName = (dayOfWeek) => {
  const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return days[dayOfWeek] || `Hari ${dayOfWeek}`;
};

const fetchSettings = async () => {
  loading.value = true;
  try {
    const res = await api.get('/settings');
    const data = res.data.data;

    schedules.value = data.schedules;
    toleranceMinutes.value = data.settings.late_tolerance_minutes?.minutes || 0;

    Object.assign(locationConfig, data.settings.office_location || {});
    Object.assign(companyInfo, data.settings.company_info || {});

    holidays.value = data.holidays;
  } catch (err) {
    toastStore.error('Gagal memuat pengaturan: ' + (err.response?.data?.message || err.message));
  } finally {
    loading.value = false;
  }
};

const saveSchedules = async () => {
  saving.value = true;
  try {
    await api.put('/settings/schedules', { schedules: schedules.value });
    toastStore.success('Jadwal kerja berhasil diperbarui!');
  } catch (err) {
    toastStore.error('Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
};

const saveTolerance = async () => {
  saving.value = true;
  try {
    await api.put('/settings/tolerance', { minutes: toleranceMinutes.value });
    toastStore.success('Toleransi keterlambatan berhasil diperbarui!');
  } catch (err) {
    toastStore.error('Gagal menyimpan toleransi: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
};

const saveLocation = async () => {
  saving.value = true;
  try {
    await api.put('/settings/location', locationConfig);
    toastStore.success('Pengaturan lokasi kantor berhasil disimpan!');
  } catch (err) {
    toastStore.error('Gagal menyimpan lokasi: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
};

const saveCompanyInfo = async () => {
  saving.value = true;
  try {
    await api.put('/settings/company', companyInfo);
    toastStore.success('Informasi dokumen PDF berhasil diperbarui!');
  } catch (err) {
    toastStore.error('Gagal menyimpan info perusahaan: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toastStore.error('Browser tidak mendukung GPS');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locationConfig.latitude = Number(pos.coords.latitude.toFixed(6));
      locationConfig.longitude = Number(pos.coords.longitude.toFixed(6));
      toastStore.success('Koordinat lokasi saat ini berhasil diisi!');
    },
    (err) => {
      toastStore.error('Gagal membaca GPS: ' + err.message);
    }
  );
};

const saveHoliday = async () => {
  saving.value = true;
  try {
    await api.post('/settings/holidays', newHoliday);
    toastStore.success('Hari libur berhasil ditambahkan!');
    holidayModalOpen.value = false;
    newHoliday.holiday_date = '';
    newHoliday.name = '';
    await fetchSettings();
  } catch (err) {
    toastStore.error('Gagal menambah hari libur: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
};

const deleteHoliday = async (id) => {
  if (!confirm('Hapus hari libur ini?')) return;
  try {
    await api.delete(`/settings/holidays/${id}`);
    toastStore.success('Hari libur berhasil dihapus!');
    await fetchSettings();
  } catch (err) {
    toastStore.error('Gagal menghapus hari libur: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(() => {
  fetchSettings();
});
</script>
