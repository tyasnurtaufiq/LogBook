<template>
  <div class="py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Data Presensi</h1>
        <p class="text-xs text-slate-500 mt-0.5">Kelola riwayat kehadiran, koreksi manual, dan filter data.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openCreateModal" class="btn-primary text-xs flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 4v16m8-8H4"/></svg>
          Tambah Manual
        </button>
        <button @click="openExportModal('print')" class="btn-ghost text-xs !border-indigo-500/30 !text-indigo-300 hover:!bg-indigo-500/10 flex items-center gap-1.5 font-medium">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Cetak / PDF (HTML)
        </button>
        <button @click="openExportModal('csv')" class="btn-ghost text-xs !border-emerald-500/20 !text-emerald-400 hover:!bg-emerald-500/10 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          CSV
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in-up-delay-1">
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <div class="relative flex-1 min-w-[180px]">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="Cari catatan atau tanggal..."
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all"
          />
        </div>

        <select
          v-model="filters.status"
          @change="fetchData(1)"
          class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 [color-scheme:dark]"
        >
          <option value="ALL">Semua Status</option>
          <option value="TEPAT_WAKTU">Tepat Waktu</option>
          <option value="TERLAMBAT">Terlambat</option>
          <option value="PULANG_CEPAT">Pulang Cepat</option>
          <option value="LEMBUR">Lembur</option>
          <option value="HARI_LIBUR">Hari Libur</option>
        </select>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Month Picker Quick Filter -->
        <select
          v-model="filters.month"
          @change="onMonthChange"
          class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 [color-scheme:dark]"
          title="Pilih filter bulan"
        >
          <option value="">Semua Bulan</option>
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>

        <!-- Date Range Filter -->
        <div class="flex items-center gap-1.5">
          <input v-model="filters.startDate" @change="onCustomDateChange" type="date" class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]" title="Tanggal Mulai" />
          <span class="text-slate-600">—</span>
          <input v-model="filters.endDate" @change="onCustomDateChange" type="date" class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]" title="Tanggal Selesai" />
        </div>

        <button @click="resetFilters" class="px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.04] border border-slate-700/30 transition-colors text-xs">
          Reset
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="glass-card overflow-hidden animate-fade-in-up-delay-2">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.04]">
              <th class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">#</th>
              <th @click="handleSort('status')" class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors">
                Status <span class="ml-1 opacity-50">{{ getSortIcon('status') }}</span>
              </th>
              <th @click="handleSort('work_date')" class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors">
                Tanggal <span class="ml-1 opacity-50">{{ getSortIcon('work_date') }}</span>
              </th>
              <th class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">Masuk</th>
              <th class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pulang</th>
              <th class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">Durasi</th>
              <th @click="handleSort('late_minutes')" class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors">
                Telat <span class="ml-1 opacity-50">{{ getSortIcon('late_minutes') }}</span>
              </th>
              <th @click="handleSort('overtime_minutes')" class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors">
                Lembur <span class="ml-1 opacity-50">{{ getSortIcon('overtime_minutes') }}</span>
              </th>
              <th class="py-3 px-4 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">Catatan</th>
              <th class="py-3 px-4 text-right text-[10px] font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr><td colspan="10" class="py-16 text-center text-slate-600 text-xs">Memuat data...</td></tr>
            </template>
            <template v-else-if="items.length === 0">
              <tr><td colspan="10" class="py-16 text-center text-slate-600 text-xs">Tidak ada data yang ditemukan</td></tr>
            </template>
            <tr
              v-else
              v-for="(item, idx) in items"
              :key="item.id"
              class="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
            >
              <td class="py-2.5 px-4 font-mono text-slate-600 text-[10px]">{{ (pagination.page - 1) * pagination.limit + idx + 1 }}</td>
              <td class="py-2.5 px-4">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="getStatusBadgeClass(item.status)">
                  {{ formatStatusLabel(item.status) }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-slate-300 whitespace-nowrap">{{ formatDateDisplay(item.work_date) }}</td>
              <td class="py-2.5 px-4 font-mono text-emerald-400 font-medium">{{ formatTime(item.check_in_at) }}</td>
              <td class="py-2.5 px-4 font-mono text-rose-400 font-medium">{{ formatTime(item.check_out_at) }}</td>
              <td class="py-2.5 px-4 text-slate-400 font-mono">{{ calculateDuration(item.check_in_at, item.check_out_at) }}</td>
              <td class="py-2.5 px-4 font-mono" :class="item.late_minutes > 0 ? 'text-rose-400' : 'text-slate-600'">
                {{ item.late_minutes > 0 ? `${item.late_minutes}m` : '—' }}
              </td>
              <td class="py-2.5 px-4 font-mono" :class="item.overtime_minutes > 0 ? 'text-amber-400' : 'text-slate-600'">
                {{ item.overtime_minutes > 0 ? `${item.overtime_minutes}m` : '—' }}
              </td>
              <td class="py-2.5 px-4 text-slate-500 max-w-[160px] truncate" :title="item.notes">{{ item.notes || '—' }}</td>
              <td class="py-2.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openEditModal(item)" class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Edit">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="confirmDelete(item)" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Hapus">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
        <span class="text-slate-500">
          {{ pagination.total }} total &middot; Hal. {{ pagination.page }}/{{ pagination.totalPages }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="fetchData(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] border border-slate-700/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          <button
            @click="fetchData(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] border border-slate-700/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ModalDialog v-model="modalOpen" :title="isEditing ? 'Koreksi Presensi' : 'Tambah Presensi Manual'">
      <form @submit.prevent="saveAttendance" class="space-y-4">
        <div v-if="!isEditing" class="space-y-1.5">
          <label class="block text-xs font-medium text-slate-400">Tanggal Kerja</label>
          <input v-model="form.work_date" type="date" required class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-white [color-scheme:dark] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all" />
        </div>
        <div v-else class="space-y-1.5">
          <label class="block text-xs font-medium text-slate-400">Tanggal Kerja</label>
          <input :value="formatDateDisplay(form.work_date)" disabled class="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-slate-700/30 text-sm text-slate-400 cursor-not-allowed opacity-80" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-400">Jam Masuk</label>
            <input v-model="form.check_in_time" type="time" required class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-white [color-scheme:dark] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-400">Jam Pulang</label>
            <input v-model="form.check_out_time" type="time" class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-white [color-scheme:dark] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all" />
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-slate-400">Catatan / Alasan</label>
          <textarea v-model="form.notes" rows="2" placeholder="Alasan koreksi manual..." class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/40 text-sm text-white placeholder-slate-600 resize-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all"></textarea>
        </div>
        <div class="flex justify-end gap-2.5 pt-2">
          <button type="button" @click="modalOpen = false" class="btn-ghost text-xs">Batal</button>
          <button type="submit" :disabled="submitting" class="btn-primary text-xs">
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </ModalDialog>

    <!-- Delete Confirmation Modal -->
    <ModalDialog v-model="deleteModalOpen" title="Hapus Data Presensi">
      <p class="text-sm text-slate-400">
        Yakin ingin menghapus catatan presensi tanggal
        <strong class="text-white">{{ formatDateDisplay(selectedItem?.work_date) }}</strong>?
        Tindakan ini akan dicatat ke audit log.
      </p>
      <template #footer>
        <button @click="deleteModalOpen = false" class="btn-ghost text-xs">Batal</button>
        <button @click="executeDelete" :disabled="submitting" class="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 transition-all">
          {{ submitting ? 'Menghapus...' : 'Hapus' }}
        </button>
      </template>
    </ModalDialog>

    <!-- Export Modal Dialog -->
    <ModalDialog v-model="exportModalOpen" :title="exportType === 'print' ? 'Cetak Laporan Presensi' : 'Export Laporan CSV'">
      <div class="space-y-4">
        <!-- Format Tabs -->
        <div class="flex items-center gap-2 p-1 bg-white/[0.03] rounded-xl border border-slate-700/40 text-xs">
          <button
            type="button"
            @click="exportType = 'print'"
            class="flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5"
            :class="exportType === 'print' ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Cetak / PDF (HTML)
          </button>
          <button
            type="button"
            @click="exportType = 'csv'"
            class="flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5"
            :class="exportType === 'csv' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Excel / CSV
          </button>
        </div>

        <!-- Periode Mode Selection -->
        <div class="space-y-2.5">
          <label class="block text-xs font-semibold text-slate-300">Pilih Periode yang Ingin Diexport:</label>

          <!-- Opsi 1: Pilihan Bulan -->
          <div
            @click="exportMode = 'month'"
            class="p-3.5 rounded-xl border transition-all cursor-pointer space-y-2"
            :class="exportMode === 'month' ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-white/[0.02] border-slate-700/40 text-slate-400 hover:bg-white/[0.04]'"
          >
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input type="radio" value="month" v-model="exportMode" class="text-indigo-600 focus:ring-indigo-500" />
                <span>Pilih Berdasarkan Bulan</span>
              </label>
              <span class="text-[10px] text-indigo-400 font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Direkomendasikan</span>
            </div>

            <div v-if="exportMode === 'month'" class="pt-1">
              <select
                v-model="exportSelectedMonth"
                class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 [color-scheme:dark]"
              >
                <option v-for="m in monthOptions" :key="m.value" :value="m.value">
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Opsi 2: Rentang Tanggal Kustom -->
          <div
            @click="exportMode = 'range'"
            class="p-3.5 rounded-xl border transition-all cursor-pointer space-y-2"
            :class="exportMode === 'range' ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-white/[0.02] border-slate-700/40 text-slate-400 hover:bg-white/[0.04]'"
          >
            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input type="radio" value="range" v-model="exportMode" class="text-indigo-600 focus:ring-indigo-500" />
              <span>Rentang Tanggal Kustom</span>
            </label>

            <div v-if="exportMode === 'range'" class="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label class="block text-[10px] text-slate-500 mb-1">Dari Tanggal</label>
                <input
                  v-model="exportCustomStart"
                  type="date"
                  class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs [color-scheme:dark]"
                />
              </div>
              <div>
                <label class="block text-[10px] text-slate-500 mb-1">Sampai Tanggal</label>
                <input
                  v-model="exportCustomEnd"
                  type="date"
                  class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <!-- Opsi 3: Semua Riwayat Data -->
          <div
            @click="exportMode = 'all'"
            class="p-3.5 rounded-xl border transition-all cursor-pointer"
            :class="exportMode === 'all' ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-white/[0.02] border-slate-700/40 text-slate-400 hover:bg-white/[0.04]'"
          >
            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input type="radio" value="all" v-model="exportMode" class="text-indigo-600 focus:ring-indigo-500" />
              <span>Semua Riwayat Presensi (Keseluruhan)</span>
            </label>
          </div>
        </div>

        <p class="text-[11px] text-slate-400 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
          ℹ️ Dokumen laporan akan menyertakan riwayat presensi harian, jam masuk/pulang, keterlambatan, lembur, dan ringkasan kehadiran lengkap siap cetak atau disimpan ke PDF.
        </p>

        <!-- Actions -->
        <div class="flex justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
          <button type="button" @click="exportModalOpen = false" class="btn-ghost text-xs">Batal</button>
          <button
            type="button"
            @click="executeExport"
            :disabled="exporting"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            :class="exportType === 'print' ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-indigo-500/20' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/20'"
          >
            <svg v-if="exporting" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            <span>{{ exporting ? 'Menyiapkan...' : exportType === 'print' ? '🖨️ Buka & Cetak / Simpan PDF' : 'Unduh CSV' }}</span>
          </button>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { DateTime } from 'luxon';
import api from '../../services/api';
import ModalDialog from '../../components/ModalDialog.vue';
import { useToastStore } from '../../stores/toast.store';
import { downloadReportFile, openReportPrint } from '../../utils/download';

const toastStore = useToastStore();

const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const modalOpen = ref(false);
const deleteModalOpen = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);

// Export Modal State
const exportModalOpen = ref(false);
const exportType = ref('print');
const exportMode = ref('month'); // 'month' | 'range' | 'all'
const exportSelectedMonth = ref(DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM'));
const exportCustomStart = ref('');
const exportCustomEnd = ref('');
const exporting = ref(false);

const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 1 });

const filters = reactive({
  search: '', status: 'ALL', month: '', startDate: '', endDate: '',
  sortBy: 'work_date', sortOrder: 'desc'
});

// Generate 12 recent months options
const monthOptions = computed(() => {
  const list = [];
  const now = DateTime.now().setZone('Asia/Jakarta');
  for (let i = 0; i < 12; i++) {
    const d = now.minus({ months: i });
    const val = d.toFormat('yyyy-MM');
    const rawLabel = d.setLocale('id').toFormat('MMMM yyyy');
    // Capitalize first letter of month
    const capLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
    const label = i === 0 ? `${capLabel} (Bulan Ini)` : i === 1 ? `${capLabel} (Bulan Lalu)` : capLabel;
    list.push({ value: val, label });
  }
  return list;
});

const onMonthChange = () => {
  if (!filters.month) {
    filters.startDate = '';
    filters.endDate = '';
  } else {
    const dt = DateTime.fromFormat(filters.month, 'yyyy-MM', { zone: 'Asia/Jakarta' });
    filters.startDate = dt.startOf('month').toFormat('yyyy-MM-dd');
    filters.endDate = dt.endOf('month').toFormat('yyyy-MM-dd');
  }
  fetchData(1);
};

const onCustomDateChange = () => {
  filters.month = '';
  fetchData(1);
};

const form = reactive({
  id: null, work_date: '', check_in_time: '07:30', check_out_time: '16:00', notes: ''
});

let searchTimeout = null;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => fetchData(1), 400);
};

const handleSort = (col) => {
  if (filters.sortBy === col) {
    filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    filters.sortBy = col;
    filters.sortOrder = 'desc';
  }
  fetchData(1);
};

const getSortIcon = (col) => {
  if (filters.sortBy !== col) return '↕';
  return filters.sortOrder === 'asc' ? '▲' : '▼';
};

const fetchData = async (page = pagination.page) => {
  loading.value = true;
  pagination.page = page;
  try {
    const res = await api.get('/attendance/list', {
      params: {
        page: pagination.page, limit: pagination.limit, search: filters.search,
        status: filters.status, startDate: filters.startDate || null,
        endDate: filters.endDate || null, sortBy: filters.sortBy, sortOrder: filters.sortOrder
      }
    });
    items.value = res.data.data.data;
    pagination.total = res.data.data.pagination.total;
    pagination.totalPages = res.data.data.pagination.totalPages;
  } catch (err) {
    toastStore.error('Gagal memuat data: ' + (err.response?.data?.message || err.message));
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  Object.assign(filters, { search: '', status: 'ALL', month: '', startDate: '', endDate: '', sortBy: 'work_date', sortOrder: 'desc' });
  fetchData(1);
};

const openCreateModal = () => {
  isEditing.value = false;
  Object.assign(form, { id: null, work_date: DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd'), check_in_time: '07:30', check_out_time: '16:00', notes: '' });
  modalOpen.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  selectedItem.value = item;
  Object.assign(form, {
    id: item.id, work_date: formatDateRaw(item.work_date),
    check_in_time: item.check_in_at ? formatTime(item.check_in_at) : '07:30',
    check_out_time: item.check_out_at ? formatTime(item.check_out_at) : '',
    notes: item.notes ? item.notes.replace(/^\[Koreksi Manual\]\s*/, '') : ''
  });
  modalOpen.value = true;
};

const saveAttendance = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/attendance/manual/${form.id}`, { check_in_time: form.check_in_time, check_out_time: form.check_out_time || null, notes: form.notes });
      toastStore.success('Koreksi berhasil disimpan!');
    } else {
      await api.post('/attendance/manual', { work_date: form.work_date, check_in_time: form.check_in_time, check_out_time: form.check_out_time || null, notes: form.notes });
      toastStore.success('Presensi manual ditambahkan!');
    }
    modalOpen.value = false;
    fetchData();
  } catch (err) {
    toastStore.error('Gagal menyimpan: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (item) => { selectedItem.value = item; deleteModalOpen.value = true; };

const executeDelete = async () => {
  submitting.value = true;
  try {
    await api.delete(`/attendance/manual/${selectedItem.value.id}`);
    toastStore.success('Data berhasil dihapus!');
    deleteModalOpen.value = false;
    fetchData();
  } catch (err) {
    toastStore.error('Gagal menghapus: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const openExportModal = (type = 'print') => {
  exportType.value = type === 'pdf' ? 'print' : type;
  if (filters.month) {
    exportMode.value = 'month';
    exportSelectedMonth.value = filters.month;
  } else if (filters.startDate || filters.endDate) {
    exportMode.value = 'range';
    exportCustomStart.value = filters.startDate;
    exportCustomEnd.value = filters.endDate;
  } else {
    exportMode.value = 'month';
    exportSelectedMonth.value = DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM');
  }
  exportModalOpen.value = true;
};

const executeExport = async () => {
  exporting.value = true;
  try {
    const params = {};
    if (exportMode.value === 'month') {
      params.month = exportSelectedMonth.value;
    } else if (exportMode.value === 'range') {
      if (exportCustomStart.value) params.from = exportCustomStart.value;
      if (exportCustomEnd.value) params.to = exportCustomEnd.value;
    }
    // If 'all', omit date params to export full attendance history

    if (exportType.value === 'print') {
      await openReportPrint(params);
      toastStore.success('Halaman cetak / simpan PDF dibuka di tab baru!');
      exportModalOpen.value = false;
      return;
    }

    const result = await downloadReportFile(`/reports/${exportType.value}`, params, exportType.value);
    toastStore.success(`File ${result.filename} (${Math.round(result.size / 1024)} KB) berhasil diunduh!`);
    exportModalOpen.value = false;
  } catch (err) {
    toastStore.error(`Gagal memproses export: ${err.message}`);
  } finally {
    exporting.value = false;
  }
};

const downloadReport = (type = 'print') => {
  openExportModal(type);
};

const formatTime = (isoString) => {
  if (!isoString) return '—';
  return DateTime.fromISO(isoString).setZone('Asia/Jakarta').toFormat('HH:mm');
};

const formatDateRaw = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
    return dateVal.split('T')[0];
  }
  return dateVal.toISOString().split('T')[0];
};

const formatDateDisplay = (dateVal) => {
  if (!dateVal) return '—';
  const str = formatDateRaw(dateVal);
  return DateTime.fromISO(str).setLocale('id').toFormat('EEE, dd MMM yyyy');
};

const calculateDuration = (inIso, outIso) => {
  if (!inIso || !outIso) return '—';
  const mins = Math.floor((new Date(outIso) - new Date(inIso)) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
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

onMounted(() => fetchData(1));
</script>
