<template>
  <div class="py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          Laporan Kegiatan Harian
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Catat dan kelola tugas kerja, pemeliharaan perangkat/jaringan, serta logbook harian Anda.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="openCreateModal"
          class="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kegiatan
        </button>

        <button
          @click="openExportModal('print')"
          class="btn-ghost text-xs !border-indigo-500/30 !text-indigo-300 hover:!bg-indigo-500/10 flex items-center gap-1.5 font-medium"
          title="Buka pratinjau cetak & simpan PDF"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak / PDF
        </button>

        <button
          @click="openExportModal('csv')"
          class="btn-ghost text-xs !border-emerald-500/20 !text-emerald-400 hover:!bg-emerald-500/10 flex items-center gap-1.5 font-medium"
          title="Ekspor data kegiatan ke CSV / Excel"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CSV
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
      <StatCard
        title="Total Kegiatan"
        :value="`${activityStore.stats.totalActivities || 0}`"
        subtext="Periode terpilih"
        iconBgClass="bg-indigo-500/10"
      >
        <template #icon>
          <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        title="Selesai"
        :value="`${activityStore.stats.completedCount || 0}`"
        subtext="Pekerjaan tuntas"
        iconBgClass="bg-emerald-500/10"
      >
        <template #icon>
          <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        title="Dalam Proses"
        :value="`${activityStore.stats.inProgressCount || 0}`"
        subtext="Sedang berjalan"
        iconBgClass="bg-amber-500/10"
      >
        <template #icon>
          <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        title="Hari Aktif"
        :value="`${activityStore.stats.totalActiveDays || 0} Hari`"
        subtext="Ada kegiatan kerja"
        iconBgClass="bg-sky-500/10"
      >
        <template #icon>
          <svg class="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Filters Toolbar -->
    <div class="glass-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in-up-delay-1">
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[180px]">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="Cari kegiatan, lokasi, output..."
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="filters.status"
          @change="fetchData(1)"
          class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 [color-scheme:dark]"
        >
          <option value="ALL">Semua Status</option>
          <option value="SELESAI">Selesai</option>
          <option value="PROSES">Dalam Proses</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Month Quick Filter -->
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

        <!-- Custom Date Range -->
        <div class="flex items-center gap-1.5">
          <input
            v-model="filters.startDate"
            @change="onCustomDateChange"
            type="date"
            class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]"
            title="Tanggal Mulai"
          />
          <span class="text-slate-600">—</span>
          <input
            v-model="filters.endDate"
            @change="onCustomDateChange"
            type="date"
            class="px-3 py-2 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]"
            title="Tanggal Selesai"
          />
        </div>

        <button
          @click="resetFilters"
          class="px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.04] border border-slate-700/30 transition-colors text-xs"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="glass-card overflow-hidden animate-fade-in-up-delay-2">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.04] text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
              <th class="py-3.5 px-4 text-left w-12">#</th>
              <th class="py-3.5 px-4 text-left w-24">Status</th>
              <th class="py-3.5 px-4 text-left w-36">Tanggal & Hari</th>
              <th class="py-3.5 px-4 text-left w-28">Waktu</th>
              <th class="py-3.5 px-4 text-left min-w-[200px]">Uraian Kegiatan</th>
              <th class="py-3.5 px-4 text-left min-w-[140px]">Lokasi / Bagian</th>
              <th class="py-3.5 px-4 text-left min-w-[150px]">Hasil / Output</th>
              <th class="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.03]">
            <!-- Loading Skeleton -->
            <template v-if="activityStore.loading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td v-for="j in 8" :key="j" class="py-4 px-4">
                  <div class="h-3.5 bg-white/[0.04] rounded"></div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else-if="activityStore.activities.length === 0">
              <td colspan="8" class="py-16 text-center text-slate-500">
                <div class="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-3 text-slate-600">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p class="text-xs font-medium text-slate-400">Belum ada catatan kegiatan harian</p>
                <p class="text-[11px] text-slate-600 mt-1">Gunakan tombol "Tambah Kegiatan" untuk mencatat aktivitas baru.</p>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="(row, idx) in activityStore.activities"
              :key="row.id"
              class="hover:bg-white/[0.02] transition-colors group"
            >
              <!-- Number -->
              <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                {{ (activityStore.pagination.page - 1) * activityStore.pagination.limit + idx + 1 }}
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                  :class="getStatusBadgeClass(row.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(row.status)"></span>
                  {{ formatStatusText(row.status) }}
                </span>
              </td>

              <!-- Tanggal & Hari -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="font-medium text-slate-200">{{ formatHumanDate(row.activity_date) }}</div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">{{ row.activity_date }}</div>
              </td>

              <!-- Waktu / Jam -->
              <td class="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                <span v-if="row.start_time || row.end_time" class="text-slate-300 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                  {{ row.start_time || '--:--' }} - {{ row.end_time || '--:--' }}
                </span>
                <span v-else class="text-slate-600">—</span>
              </td>

              <!-- Judul & Deskripsi Kegiatan -->
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-100 flex items-center gap-1.5">
                  {{ row.title }}
                </div>
                <p v-if="row.description" class="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                  {{ row.description }}
                </p>
                <p v-if="row.notes" class="text-[10px] text-indigo-400/80 mt-1 flex items-center gap-1">
                  <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  Catatan: {{ row.notes }}
                </p>
              </td>

              <!-- Lokasi / Sub Bagian -->
              <td class="py-3.5 px-4">
                <div v-if="row.location" class="inline-flex items-center gap-1 text-slate-300 bg-slate-800/40 px-2 py-0.5 rounded-md border border-slate-700/30 text-[11px]">
                  <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ row.location }}
                </div>
                <span v-else class="text-slate-600">—</span>
              </td>

              <!-- Output / Hasil -->
              <td class="py-3.5 px-4">
                <span v-if="row.output" class="text-slate-300 text-[11px]">
                  {{ row.output }}
                </span>
                <span v-else class="text-slate-600">—</span>
              </td>

              <!-- Aksi -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(row)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    title="Ubah Kegiatan"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="openDeleteModal(row)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Kegiatan"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="activityStore.pagination.totalPages > 1"
        class="p-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      >
        <span class="text-slate-500 text-[11px]">
          Menampilkan <span class="text-white font-medium">{{ activityStore.activities.length }}</span> dari
          <span class="text-white font-medium">{{ activityStore.pagination.total }}</span> kegiatan
        </span>

        <div class="flex items-center gap-1.5">
          <button
            @click="fetchData(activityStore.pagination.page - 1)"
            :disabled="activityStore.pagination.page <= 1"
            class="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.08] transition-all text-xs"
          >
            Sebelumnya
          </button>

          <span class="px-3 py-1.5 text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            {{ activityStore.pagination.page }} / {{ activityStore.pagination.totalPages }}
          </span>

          <button
            @click="fetchData(activityStore.pagination.page + 1)"
            :disabled="activityStore.pagination.page >= activityStore.pagination.totalPages"
            class="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-slate-700/40 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.08] transition-all text-xs"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CREATE / EDIT -->
    <ModalDialog
      :show="showFormModal"
      :title="isEditing ? 'Ubah Catatan Kegiatan' : 'Tambah Kegiatan Harian'"
      @close="closeFormModal"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Tanggal & Waktu -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Tanggal Kegiatan <span class="text-rose-400">*</span></label>
            <input
              v-model="form.activity_date"
              type="date"
              required
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 [color-scheme:dark]"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Jam Mulai</label>
            <input
              v-model="form.start_time"
              type="time"
              placeholder="HH:mm"
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 [color-scheme:dark]"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Jam Selesai</label>
            <input
              v-model="form.end_time"
              type="time"
              placeholder="HH:mm"
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 [color-scheme:dark]"
            />
          </div>
        </div>

        <!-- Judul Kegiatan -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">
            Nama / Judul Kegiatan <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Contoh: Penggantian connector RJ45 di sub bagian keuangan"
            class="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600"
          />
        </div>

        <!-- Lokasi / Sub Bagian & Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Lokasi / Sub Bagian / Unit</label>
            <input
              v-model="form.location"
              type="text"
              placeholder="Contoh: Sub Bagian Keuangan / Lantai 2"
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Status Kegiatan</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 [color-scheme:dark]"
            >
              <option value="SELESAI">Selesai (Tuntas)</option>
              <option value="PROSES">Dalam Proses (On Progress)</option>
              <option value="PENDING">Pending (Tertunda)</option>
            </select>
          </div>
        </div>

        <!-- Deskripsi Kegiatan -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi / Rincian Pekerjaan</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Rincian kendala yang dihadapi atau tindakan teknis yang diambil..."
            class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600 resize-none"
          ></textarea>
        </div>

        <!-- Output / Hasil Pekerjaan -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">Hasil / Output Pekerjaan</label>
          <textarea
            v-model="form.output"
            rows="2"
            placeholder="Contoh: Kabel LAN berhasil di-crimping ulang, koneksi internet normal dan terhubung ke switch."
            class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600 resize-none"
          ></textarea>
        </div>

        <!-- Catatan Tambahan -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">Catatan Tambahan (Opsional)</label>
          <input
            v-model="form.notes"
            type="text"
            placeholder="Catatan kecil atau rekomendasi tindak lanjut..."
            class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600"
          />
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            @click="closeFormModal"
            class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="activityStore.actionLoading"
            class="btn-primary text-xs !py-2 !px-5 flex items-center gap-1.5"
          >
            <svg v-if="activityStore.actionLoading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Simpan Perubahan' : 'Tambah Kegiatan' }}
          </button>
        </div>
      </form>
    </ModalDialog>

    <!-- MODAL CONFIRM DELETE -->
    <ModalDialog
      :show="showDeleteModal"
      title="Hapus Catatan Kegiatan"
      @close="showDeleteModal = false"
    >
      <div class="space-y-4">
        <p class="text-xs text-slate-300 leading-relaxed">
          Apakah Anda yakin ingin menghapus catatan kegiatan:
          <span class="font-bold text-white block mt-1 bg-white/[0.04] p-2.5 rounded-lg border border-white/[0.06]">
            "{{ selectedActivity?.title }}"
          </span>
        </p>
        <p class="text-[11px] text-rose-400/80">
          Tindakan ini tidak dapat dibatalkan dan akan dicatat pada riwayat audit log.
        </p>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            @click="showDeleteModal = false"
            class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmDelete"
            :disabled="activityStore.actionLoading"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            Hapus Sekarang
          </button>
        </div>
      </div>
    </ModalDialog>

    <!-- MODAL EXPORT -->
    <ModalDialog
      :show="showExportModal"
      title="Ekspor Laporan Kegiatan Harian"
      @close="showExportModal = false"
    >
      <div class="space-y-4">
        <p class="text-xs text-slate-400">
          Pilih rentang periode laporan kegiatan yang ingin dicetak atau diunduh:
        </p>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Dari Tanggal</label>
            <input
              v-model="exportParams.from"
              type="date"
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Sampai Tanggal</label>
            <input
              v-model="exportParams.to"
              type="date"
              class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Filter Status</label>
          <select
            v-model="exportParams.status"
            class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-700/50 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 [color-scheme:dark]"
          >
            <option value="ALL">Semua Status</option>
            <option value="SELESAI">Hanya Selesai</option>
            <option value="PROSES">Hanya Dalam Proses</option>
            <option value="PENDING">Hanya Pending</option>
          </select>
        </div>

        <!-- Action Export Buttons -->
        <div class="pt-3 border-t border-white/[0.06] space-y-2">
          <button
            @click="triggerExport('print')"
            :disabled="exporting"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Buka Pratinjau & Cetak / PDF (HTML)
          </button>

          <div class="grid grid-cols-2 gap-2">
            <button
              @click="triggerExport('pdf')"
              :disabled="exporting"
              class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] border border-slate-700/50 hover:bg-white/[0.08] text-slate-200 transition-all disabled:opacity-50"
            >
              <svg class="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Unduh File PDF
            </button>

            <button
              @click="triggerExport('csv')"
              :disabled="exporting"
              class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] border border-slate-700/50 hover:bg-white/[0.08] text-slate-200 transition-all disabled:opacity-50"
            >
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh File CSV
            </button>
          </div>
        </div>
      </div>
    </ModalDialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { DateTime } from 'luxon';
import { useActivityStore } from '../../stores/activity.store';
import { useToastStore } from '../../stores/toast.store';
import { downloadReportFile, openReportPrint } from '../../utils/download';
import StatCard from '../../components/StatCard.vue';
import ModalDialog from '../../components/ModalDialog.vue';

const activityStore = useActivityStore();
const toastStore = useToastStore();

const showFormModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const showDeleteModal = ref(false);
const selectedActivity = ref(null);

const showExportModal = ref(false);
const exporting = ref(false);

const filters = reactive({
  search: '',
  status: 'ALL',
  month: '',
  startDate: '',
  endDate: ''
});

const form = reactive({
  activity_date: '',
  start_time: '',
  end_time: '',
  title: '',
  location: '',
  description: '',
  output: '',
  status: 'SELESAI',
  notes: ''
});

const exportParams = reactive({
  from: '',
  to: '',
  status: 'ALL'
});

// Month options generator
const monthOptions = ref([]);
const initMonthOptions = () => {
  const options = [];
  const now = DateTime.now().setZone('Asia/Jakarta');
  for (let i = 0; i < 12; i++) {
    const dt = now.minus({ months: i });
    options.push({
      value: dt.toFormat('yyyy-MM'),
      label: dt.setLocale('id').toFormat('MMMM yyyy')
    });
  }
  monthOptions.value = options;
};

let searchTimer = null;
const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchData(1);
  }, 350);
};

const onMonthChange = () => {
  if (filters.month) {
    const dt = DateTime.fromFormat(filters.month, 'yyyy-MM', { zone: 'Asia/Jakarta' });
    filters.startDate = dt.startOf('month').toFormat('yyyy-MM-dd');
    filters.endDate = dt.endOf('month').toFormat('yyyy-MM-dd');
  } else {
    filters.startDate = '';
    filters.endDate = '';
  }
  fetchData(1);
};

const onCustomDateChange = () => {
  filters.month = '';
  fetchData(1);
};

const resetFilters = () => {
  filters.search = '';
  filters.status = 'ALL';
  filters.month = '';
  filters.startDate = '';
  filters.endDate = '';
  fetchData(1);
};

const fetchData = async (page = 1) => {
  const params = {
    page,
    limit: activityStore.pagination.limit,
    search: filters.search || undefined,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  };

  await Promise.all([
    activityStore.fetchActivities(params),
    activityStore.fetchStats({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    })
  ]);
};

// Form Handlers
const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  const todayStr = DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd');
  const nowTime = DateTime.now().setZone('Asia/Jakarta').toFormat('HH:mm');

  form.activity_date = todayStr;
  form.start_time = nowTime;
  form.end_time = '';
  form.title = '';
  form.location = '';
  form.description = '';
  form.output = '';
  form.status = 'SELESAI';
  form.notes = '';

  showFormModal.value = true;
};

const openEditModal = (activity) => {
  isEditing.value = true;
  editingId.value = activity.id;

  const dateStr = activity.activity_date instanceof Date
    ? activity.activity_date.toISOString().split('T')[0]
    : String(activity.activity_date);

  form.activity_date = dateStr;
  form.start_time = activity.start_time || '';
  form.end_time = activity.end_time || '';
  form.title = activity.title || '';
  form.location = activity.location || '';
  form.description = activity.description || '';
  form.output = activity.output || '';
  form.status = activity.status || 'SELESAI';
  form.notes = activity.notes || '';

  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const submitForm = async () => {
  if (!form.title.trim()) {
    toastStore.error('Nama/judul kegiatan wajib diisi');
    return;
  }

  const payload = {
    activity_date: form.activity_date,
    start_time: form.start_time || null,
    end_time: form.end_time || null,
    title: form.title.trim(),
    location: form.location ? form.location.trim() : null,
    description: form.description ? form.description.trim() : null,
    output: form.output ? form.output.trim() : null,
    status: form.status,
    notes: form.notes ? form.notes.trim() : null
  };

  if (isEditing.value) {
    const res = await activityStore.updateActivity(editingId.value, payload);
    if (res.success) {
      toastStore.success('Catatan kegiatan berhasil diperbarui');
      closeFormModal();
      await fetchData(activityStore.pagination.page);
    } else {
      toastStore.error(res.message);
    }
  } else {
    const res = await activityStore.createActivity(payload);
    if (res.success) {
      toastStore.success('Kegiatan harian berhasil ditambahkan');
      closeFormModal();
      await fetchData(1);
    } else {
      toastStore.error(res.message);
    }
  }
};

// Delete Handlers
const openDeleteModal = (activity) => {
  selectedActivity.value = activity;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!selectedActivity.value) return;
  const res = await activityStore.deleteActivity(selectedActivity.value.id);
  if (res.success) {
    toastStore.success('Catatan kegiatan berhasil dihapus');
    showDeleteModal.value = false;
    await fetchData(activityStore.pagination.page);
  } else {
    toastStore.error(res.message);
  }
};

// Export Handlers
const openExportModal = (mode = 'print') => {
  const now = DateTime.now().setZone('Asia/Jakarta');
  exportParams.from = filters.startDate || now.startOf('month').toFormat('yyyy-MM-dd');
  exportParams.to = filters.endDate || now.endOf('month').toFormat('yyyy-MM-dd');
  exportParams.status = filters.status !== 'ALL' ? filters.status : 'ALL';
  showExportModal.value = true;
};

const triggerExport = async (type) => {
  exporting.value = true;
  try {
    const params = {
      from: exportParams.from,
      to: exportParams.to,
      status: exportParams.status !== 'ALL' ? exportParams.status : undefined
    };

    if (type === 'print') {
      await openReportPrint(params, '/reports/activities/html');
      showExportModal.value = false;
      toastStore.info('Membuka pratinjau cetak laporan kegiatan...');
    } else if (type === 'pdf') {
      toastStore.info('Menyiapkan file PDF laporan kegiatan...');
      const res = await downloadReportFile('/reports/activities/pdf', params, 'pdf');
      toastStore.success(`Laporan PDF berhasil diunduh: ${res.filename}`);
      showExportModal.value = false;
    } else if (type === 'csv') {
      toastStore.info('Menyiapkan file CSV laporan kegiatan...');
      const res = await downloadReportFile('/reports/activities/csv', params, 'csv');
      toastStore.success(`Laporan CSV berhasil diunduh: ${res.filename}`);
      showExportModal.value = false;
    }
  } catch (err) {
    console.error('Export error:', err);
    toastStore.error(err.message || 'Gagal mengekspor laporan kegiatan');
  } finally {
    exporting.value = false;
  }
};

// UI Helpers
const formatHumanDate = (dateVal) => {
  if (!dateVal) return '-';
  const str = dateVal instanceof Date ? dateVal.toISOString().split('T')[0] : String(dateVal);
  return DateTime.fromISO(str).setZone('Asia/Jakarta').setLocale('id').toFormat('EEEE, dd MMM yyyy');
};

const getStatusBadgeClass = (status) => {
  const st = (status || '').toUpperCase();
  if (st === 'SELESAI') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (st === 'PROSES' || st === 'DALAM_PROSES') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
};

const getStatusDotClass = (status) => {
  const st = (status || '').toUpperCase();
  if (st === 'SELESAI') return 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
  if (st === 'PROSES' || st === 'DALAM_PROSES') return 'bg-amber-400 shadow-sm shadow-amber-400/50';
  return 'bg-slate-400';
};

const formatStatusText = (status) => {
  const st = (status || '').toUpperCase();
  if (st === 'SELESAI') return 'Selesai';
  if (st === 'PROSES' || st === 'DALAM_PROSES') return 'Dalam Proses';
  return 'Pending';
};

onMounted(() => {
  initMonthOptions();
  // Default to current month
  const now = DateTime.now().setZone('Asia/Jakarta');
  filters.month = now.toFormat('yyyy-MM');
  filters.startDate = now.startOf('month').toFormat('yyyy-MM-dd');
  filters.endDate = now.endOf('month').toFormat('yyyy-MM-dd');
  fetchData(1);
});
</script>

