const db = require('../src/config/database');
const { DateTime } = require('luxon');

const ZONE = 'Asia/Jakarta';

// Schedule for Mon(1) - Fri(5)
const SCHEDULES = {
  1: { start: '07:30', end: '16:00', isWorkday: true },
  2: { start: '07:30', end: '16:00', isWorkday: true },
  3: { start: '07:30', end: '16:00', isWorkday: true },
  4: { start: '07:30', end: '16:00', isWorkday: true },
  5: { start: '07:30', end: '14:30', isWorkday: true },
  6: { start: '08:00', end: '12:00', isWorkday: false },
  7: { start: '08:00', end: '12:00', isWorkday: false },
};

const BASE_LAT = -7.7779;
const BASE_LNG = 110.4156;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 6) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

// Koleksi aktivitas realistis disesuaikan dengan contoh di 5 gambar & 13 lokasi kewenangan user
const ACTIVITY_TEMPLATES = [
  // 1. Ruang Sub Bagian Program
  {
    title: 'Penggantian Connector RJ45 pada Subbagian Program',
    location: 'Ruang Sub Bagian Program',
    description: 'Pengecekan kabel Ethernet dan penggantian connector RJ45 yang longgar pada PC staf subbagian program.',
    output: 'Koneksi kabel LAN terhubung 1 Gbps, pengujian ping stabil 0% loss.',
    notes: 'Konektor RJ45 Cat6 diganti baru dan di-crimping ulang.'
  },
  {
    title: 'Pengecekan Kabel Ethernet Subbagian Program',
    location: 'Ruang Sub Bagian Program',
    description: 'Pemeriksaan fisik kabel LAN UTP Cat6 dari switch distribution ke meja kerja Subbagian Program.',
    output: 'Semua 6 titik kabel Ethernet terhubung baik dan beroperasi normal.',
    notes: 'Penataan kabel menggunakan cable duct rapi.'
  },
  {
    title: 'Pengecekan Jaringan WiFi Subbagian Program',
    location: 'Ruang Sub Bagian Program',
    description: 'Pengukuran kekuatan sinyal WiFi (RSSI) dan pengecekan konektivitas access point di area Subbagian Program.',
    output: 'Sinyal WiFi stabil -55 dBm, kecepatan download 45 Mbps upload 30 Mbps.',
    notes: 'Access point beroperasi normal pada frekuensi 5 GHz.'
  },
  {
    title: 'Maintenance Jaringan di Subbagian Program',
    location: 'Ruang Sub Bagian Program',
    description: 'Pembersihan port switch hub dan pengecekan alokasi IP DHCP pada seluruh workstation Subbagian Program.',
    output: 'Seluruh perangkat workstation mendapatkan IP DHCP dengan lancar.',
    notes: 'Tidak ditemukan IP conflict.'
  },

  // 2. Sub Bagian Umum
  {
    title: 'Pengecekan Kabel Ethernet Subbagian Umum',
    location: 'Sub Bagian Umum',
    description: 'Pemeriksaan sambungan kabel Ethernet UTP dari panel dinding ke komputer staf subbagian umum.',
    output: 'Kabel Ethernet terpasang kokoh, link detection 1000 Mbps full-duplex.',
    notes: 'Kabel patch cord 2 meter diperbarui.'
  },
  {
    title: 'Penggantian Connector RJ45 pada Subbagian Umum',
    location: 'Sub Bagian Umum',
    description: 'Penggantian pin konektor RJ45 yang patah penguncinya pada komputer administrasi umum.',
    output: 'Konektor baru terpasang dengan baik dan koneksi jaringan stabil.',
    notes: 'Pengujian koneksi internet dan printer sharing berhasil.'
  },
  {
    title: 'Pengecekan Jaringan WiFi Subbagian Umum',
    location: 'Sub Bagian Umum',
    description: 'Pemeriksaan jangkauan sinyal access point dan stabilitas koneksi WiFi di ruang Subbagian Umum.',
    output: 'Konektivitas WiFi normal dan tidak ada intervensi channel.',
    notes: 'Klien dapat terhubung tanpa kendala.'
  },
  {
    title: 'Maintenance Jaringan di Subbagian Umum',
    location: 'Sub Bagian Umum',
    description: 'Pengecekan koneksi jaringan printer jaringan (network printer) dan komputer arsip Subbag Umum.',
    output: 'Sharing printer jaringan dapat diakses oleh seluruh PC di Subbag Umum.',
    notes: 'IP printer statis dikonfigurasi ulang.'
  },

  // 3. Sub Bagian Keuangan
  {
    title: 'Pengecekan WiFi Subbagian Keuangan',
    location: 'Sub Bagian Keuangan',
    description: 'Pemeriksaan stabilitas jaringan nirkabel dan pengujian latency ke gateway di Subbagian Keuangan.',
    output: 'Latency ke router gateway stabil di bawah 2ms.',
    notes: 'Optimalisasi SSID internal.'
  },
  {
    title: 'Pengecekan Kabel Ethernet Subbagian Keuangan',
    location: 'Sub Bagian Keuangan',
    description: 'Pengecekan kabel data LAN untuk aplikasi keuangan (SIPD/SIMDA) di ruang Subbagian Keuangan.',
    output: 'Koneksi kabel LAN sangat stabil, akses ke server keuangan lancar.',
    notes: 'Pemeriksaan berkala kabel data.'
  },
  {
    title: 'Penggantian Connector RJ45 Subbagian Keuangan',
    location: 'Sub Bagian Keuangan',
    description: 'Penggantian connector RJ45 yang sering terputus (intermittent) pada meja bendahara pengeluaran.',
    output: 'Connector RJ45 baru terpasang, koneksi stabil tidak terputus lagi.',
    notes: 'Crimping ulang dengan plug modular Cat6.'
  },
  {
    title: 'Maintenance Jaringan di Subbagian Keuangan',
    location: 'Sub Bagian Keuangan',
    description: 'Pemeriksaan port switch-hub dan kabel data pada PC staf bagian perbendaharaan dan akuntansi.',
    output: 'Konektivitas jaringan antar workstation dan server perbendaharaan berjalan normal.',
    notes: 'Pengecekan fisik switch berjalan optimal.'
  },

  // 4. Ruang Server Utama
  {
    title: 'Maintenance Server Utama',
    location: 'Ruang Server Utama',
    description: 'Pengecekan fisik server, temperatur ruangan AC server (18°C), serta lampu indikator HDD dan status PSU.',
    output: 'Suhu server ideal, semua server rack beroperasi normal tanpa warning.',
    notes: 'Kondisi ruang server bersih dan dingin.'
  },
  {
    title: 'Backup Setting RB Utama',
    location: 'Ruang Server Utama',
    description: 'Pembuatan backup konfigurasi sistem MikroTik RouterBoard utama (.backup dan .rsc) dan export ke storage aman.',
    output: 'File backup berhasil digenerate dan diarsip ke cloud storage lokal.',
    notes: 'Ukuran file backup 1.2 MB tersimpan aman.'
  },
  {
    title: 'Pengecekan Kabel Ethernet Server Utama',
    location: 'Ruang Server Utama',
    description: 'Pemeriksaan kabel patch cord Cat6 antar core switch, router Mikrotik, dan server blade di rak server utama.',
    output: 'Semua kabel patch cord rapi, link 10Gbps/1Gbps aktif stabil.',
    notes: 'Labeling kabel diverifikasi sesuai denah port.'
  },
  {
    title: 'Penggantian Connector RJ45 di Ruang Server',
    location: 'Ruang Server Utama',
    description: 'Penggantian konektor RJ45 pada jalur kabel backup ISP di Ruang Server Utama.',
    output: 'Failover jalur internet backup berfungsi normal dengan link up 1Gbps.',
    notes: 'Pemeriksaan konektor patch panel selesai.'
  },
  {
    title: 'Konfigurasi Router Board Server',
    location: 'Ruang Server Utama',
    description: 'Optimasi routing table, firewall mangle, dan queue bandwidth management pada RouterBoard server utama.',
    output: 'Distribusi bandwidth antar unit kerja seimbang dan stabil.',
    notes: 'CPU load RouterBoard stabil di bawah 30%.'
  },
  {
    title: 'Manajemen Kabel Server',
    location: 'Ruang Server Utama',
    description: 'Perapihan cable management, horizontal cable organizer, dan velcro strap di dalam rack enclosure server utama.',
    output: 'Jalur kabel rapi, sirkulasi udara di dalam rack server lebih lancar.',
    notes: 'Tidak ada kabel terjepit.'
  },

  // 5. Ruang Server Lantai 3
  {
    title: 'Maintenance Jaringan di Ruang Server Lantai 3',
    location: 'Ruang Server Lantai 3',
    description: 'Pengecekan switch distribution lantai 3, status koneksi FO uplink, dan temperatur rack server lantai 3.',
    output: 'Uplink antar lantai via fiber optic terhubung stabil 10 Gbps.',
    notes: 'Lampu indikator SFP transceiver menyala hijau normal.'
  },
  {
    title: 'Pengujian Konektivitas Server Utama dengan Server Lt.3',
    location: 'Ruang Server Lantai 3',
    description: 'Uji latency, throughput bandwidth, dan loss packet antara core server lantai 1 dan distribution server lantai 3.',
    output: 'Latency < 1ms, packet loss 0%, throughput mencapai batas Gigabit.',
    notes: 'Koneksi backbone antar lantai sangat baik.'
  },
  {
    title: 'Manajemen Kabel di Ruang Server Lantai 3',
    location: 'Ruang Server Lantai 3',
    description: 'Penyusunan kabel patch cord dan labeling port distribution switch lantai 3.',
    output: 'Seluruh kabel tertata rapi pada cable tray dan berlabel jelas.',
    notes: 'Dokumentasi port map diperbarui.'
  },
  {
    title: 'Maintenance Switch di Rack Wallmount Server Lt. 3',
    location: 'Ruang Server Lantai 3',
    description: 'Pembersihan debu kipas switch rack, pemeriksaan tegangan input listrik, dan reboot terencana switch lantai 3.',
    output: 'Switch beroperasi optimal dengan uptime stabil.',
    notes: 'Pemeriksaan colokan listrik UPS lantai 3 baik.'
  },

  // 6. Rack Wallmount Lantai 1
  {
    title: 'Penggantian UPS untuk Rack Wallmount Lt. 1',
    location: 'Rack Wallmount Lantai 1',
    description: 'Pemasangan dan pengujian unit baterai UPS 1200VA pada Rack Wallmount Lantai 1.',
    output: 'UPS berfungsi normal, backup time teruji 25 menit saat simulasi pemadaman listrik.',
    notes: 'Indikator baterai 100% dan tegangan output 220V stabil.'
  },
  {
    title: 'Maintenance Jaringan Rack Wallmount Lantai 1',
    location: 'Rack Wallmount Lantai 1',
    description: 'Pengecekan port switch 24-port dan perapihan patch cord di dalam rack wallmount lantai 1.',
    output: 'Seluruh 20 port yang terpakai berstatus link up 1000 Mbps.',
    notes: 'Kunci rak wallmount diamankan.'
  },
  {
    title: 'Pengecekan Connector RJ45 di Rack Wallmount Lantai 1',
    location: 'Rack Wallmount Lantai 1',
    description: 'Pengecekan dan perbaikan 2 konektor RJ45 patch cord pada switch distribution lantai 1.',
    output: 'Connector diperbarui dan port kembali aktif normal.',
    notes: 'Menggunakan RJ45 modular plug berkualitas.'
  },

  // 7. Rack Wallmount Lantai 2
  {
    title: 'Penggantian Connector RJ45 di Rack WallMount Lantai 2',
    location: 'Rack Wallmount Lantai 2',
    description: 'Penggantian konektor RJ45 pada kabel uplink switch lantai 2 menuju switch distribusi.',
    output: 'Link uplink naik dari 100Mbps menjadi 1000Mbps full duplex.',
    notes: 'Permasalahan link speed teratasi.'
  },
  {
    title: 'Maintenance Switch di Rack Wallmount Lantai 2',
    location: 'Rack Wallmount Lantai 2',
    description: 'Pembersihan fisik rack wallmount lantai 2, pemeriksaan suhu switch, dan penataan patch cord.',
    output: 'Switch bersih dari debu, sirkulasi ventilasi rack lancar.',
    notes: 'Kondisi rack wallmount terkunci rapi.'
  },
  {
    title: 'Pengecekan Kabel Uplink Rack Wallmount Lantai 2',
    location: 'Rack Wallmount Lantai 2',
    description: 'Pemeriksaan redaman kabel data dan pengujian transfer data dari lantai 2 ke core switch.',
    output: 'Throughput transfer data stabil di atas 900 Mbps.',
    notes: 'Koneksi lancar tanpa interupsi.'
  },

  // 8. Bidang DalOps
  {
    title: 'Pengecekan jaringan Bidang DalOps',
    location: 'Bidang DalOps',
    description: 'Pemeriksaan konektivitas internet dan jaringan lokal komputer operasional piket Bidang DalOps.',
    output: 'Koneksi jaringan internet lancar untuk sistem pelaporan operasional 24 jam.',
    notes: 'Pengujian browsing dan streaming CCTV lancar.'
  },
  {
    title: 'Penggantian Connector RJ45 di Bidang DalOps',
    location: 'Bidang DalOps',
    description: 'Penggantian connector RJ45 pada PC monitor pemantauan lapangan Bidang DalOps.',
    output: 'Koneksi LAN kembali stabil dan tidak mengalami RTO.',
    notes: 'Connector diganti dengan tipe shielded Cat6.'
  },
  {
    title: 'Pengecekan Jaringan WiFi di Bidang DalOps',
    location: 'Bidang DalOps',
    description: 'Pengecekan coverage sinyal access point WiFi di ruang rapat dan ruang kerja Bidang DalOps.',
    output: 'Sinyal WiFi menjangkau seluruh area kerja DalOps dengan baik.',
    notes: 'Pengguna smartphone dan laptop terhubung lancar.'
  },
  {
    title: 'Optimalisasi Jaringan WiFi di Bidang DalOps',
    location: 'Bidang DalOps',
    description: 'Penyetelan channel frequency 2.4 GHz dan 5 GHz untuk mengurangi interferensi sinyal WiFi di DalOps.',
    output: 'Koneksi WiFi lebih responsif dengan jitter rendah.',
    notes: 'Channel diubah ke frekuensi bebas noise.'
  },

  // 9. Bidang Lalu Lintas
  {
    title: 'Pengecekan jaringan Bidang Lalu Lintas',
    location: 'Bidang Lalu Lintas',
    description: 'Pemeriksaan kabel LAN dan jaringan komputer staf Bidang Lalu Lintas untuk input data lalu lintas harian.',
    output: 'Jaringan komputer terhubung lancar ke server basis data lalu lintas.',
    notes: 'Koneksi lancar tanpa kendala.'
  },
  {
    title: 'Maintenance Jaringan di Bidang Lalu Lintas',
    location: 'Bidang Lalu Lintas',
    description: 'Pengecekan switch hub 16-port dan kabel drop LAN pada meja seksi rekayasa lalu lintas.',
    output: 'Seluruh port switch berfungsi baik dengan koneksi Gigabit.',
    notes: 'Kabel yang kendor dirapikan kembali.'
  },
  {
    title: 'Pengecekan Jaringan WiFi Bidang Lalu Lintas',
    location: 'Bidang Lalu Lintas',
    description: 'Pemeriksaan konektivitas nirkabel dan kecepatan internet di area Bidang Lalu Lintas.',
    output: 'Kecepatan internet stabil sesuai limitasi bandwidth profil ruangan.',
    notes: 'Speedtest menunjukkan 50 Mbps download / 30 Mbps upload.'
  },

  // 10. Bidang Angkutan
  {
    title: 'Pengecekan Jaringan Bidang Angkutan',
    location: 'Bidang Angkutan',
    description: 'Pemeriksaan jaringan LAN komputer pelayanan perizinan dan administrasi Bidang Angkutan.',
    output: 'Aplikasi pelayanan perizinan angkutan dapat diakses tanpa hambatan.',
    notes: 'Koneksi database pusat normal.'
  },
  {
    title: 'Penggantian Connector RJ45 di Bidang Angkutan',
    location: 'Bidang Angkutan',
    description: 'Penggantian konektor kabel LAN yang rusak akibat tertarik meja pada seksi angkutan orang.',
    output: 'Kabel di-crimping ulang dan link jaringan kembali terhubung normal.',
    notes: 'Pemasangan pelindung boot connector baru.'
  },
  {
    title: 'Penggantian Kabel UTP Cat6 di Bidang Angkutan',
    location: 'Bidang Angkutan',
    description: 'Penarikan kabel UTP Cat6 baru sepanjang 15 meter dari switch hub ke meja pelayanan Bidang Angkutan.',
    output: 'Kabel baru terpasang di dalam cable duct dengan proteksi rapi.',
    notes: 'Pengujian wire-map kabel tester 8 pin lurus normal (straight-through).'
  },
  {
    title: 'Konfigurasi Access Point di Bidang Angkutan',
    location: 'Bidang Angkutan',
    description: 'Re-konfigurasi security WPA2-Enterprise dan optimalisasi roaming Access Point Bidang Angkutan.',
    output: 'Koneksi nirkabel aman dan perangkat beralih antar AP dengan mulus.',
    notes: 'Firmware Access Point diperbarui ke versi stabil.'
  },

  // 11. Bidang Sarana Prasarana
  {
    title: 'Maintenance WiFi di Bidang Sarana Prasarana',
    location: 'Bidang Sarana Prasarana',
    description: 'Pengecekan kekuatan sinyal nirkabel dan reboot terjadwal Access Point di Bidang Sarana Prasarana.',
    output: 'Access Point bekerja normal, semua staf dapat terhubung internet.',
    notes: 'Pemeriksaan adaptor PoE Access Point normal.'
  },
  {
    title: 'Maintenance Jaringan di Bidang Sarana Prasarana',
    location: 'Bidang Sarana Prasarana',
    description: 'Pengecekan jaringan komputer staf perlengkapan dan sarana prasarana.',
    output: 'Koneksi LAN ke file server lokal berjalan cepat dan stabil.',
    notes: 'Pengujian copy file 1GB berlangsung lancar.'
  },
  {
    title: 'Penggantian Connector RJ45 di Bidang Sarana Prasarana',
    location: 'Bidang Sarana Prasarana',
    description: 'Penggantian konektor RJ45 pada PC administrasi sarpras yang pin tembaganya teroksidasi.',
    output: 'Konektor diganti baru, kecepatan link meningkat menjadi 1 Gbps.',
    notes: 'Tester kabel menunjukkan konektivitas sempurna.'
  },

  // 12. Balai PTPAR
  {
    title: 'Maintenance WiFi Balai PTPAR',
    location: 'Balai PTPAR',
    description: 'Pemeriksaan jaringan internet wireless dan router outdoor di gedung Balai PTPAR.',
    output: 'Koneksi internet Balai PTPAR terhubung stabil ke jaringan Dishub.',
    notes: 'Perangkat outdoor dalam kondisi prima.'
  },
  {
    title: 'Penggantian Access Point Balai PTPAR',
    location: 'Balai PTPAR',
    description: 'Pemasangan unit Access Point Dual-Band baru untuk menggantikan perangkat lama yang sering restart di Balai PTPAR.',
    output: 'Access point baru aktif, jangkauan sinyal lebih luas dan stabil.',
    notes: 'Pengujian koneksi 20 klien bersamaan lancar.'
  },
  {
    title: 'Maintenance Jaringan Ruang Balai PTPAR',
    location: 'Balai PTPAR',
    description: 'Pengecekan kabel UTP dan switch distribusi di ruang kantor Balai PTPAR.',
    output: 'Seluruh perangkat komputer kantor Balai PTPAR online dan terkoneksi internet.',
    notes: 'Pemeriksaan berkala jaringan remote.'
  },

  // 13. Perpustakaan
  {
    title: 'Maintenance Jaringan di Ruang Perpustakaan',
    location: 'Perpustakaan',
    description: 'Pengecekan koneksi jaringan komputer katalog perpustakaan dan PC browsing pengunjung.',
    output: 'Aplikasi otomasi perpustakaan online dan dapat diakses dengan cepat.',
    notes: 'Kabel LAN di bawah karpet tertata rapi.'
  },
  {
    title: 'Pengecekan WiFi di Ruang Perpustakaan',
    location: 'Perpustakaan',
    description: 'Pengecekan kualitas sinyal WiFi untuk kenyamanan pengunjung membaca di ruang perpustakaan.',
    output: 'Sinyal WiFi stabil -58 dBm di seluruh sudut ruang baca.',
    notes: 'Bandwidth dialokasikan cukup untuk browsing edukasi.'
  },
  {
    title: 'Penggantian Connector RJ45 di Ruang Perpustakaan',
    location: 'Perpustakaan',
    description: 'Penggantian konektor RJ45 pada komputer server katalog buku perpustakaan.',
    output: 'Koneksi data katalog lancar tanpa putus-putus.',
    notes: 'Penggantian konektor dilakukan dengan cepat.'
  }
];

async function run() {
  console.log('=== MEMULAI GENERASI DATA DUMMY PRESENSI & KEGIATAN HARIAN ===\n');

  // 1. Ambil data user
  const user = await db('users').first();
  if (!user) throw new Error('User tidak ditemukan!');
  const userId = user.id;
  console.log(`User target: ${user.name} (${user.email}), ID: ${userId}`);

  // 2. Ambil hari libur
  const holidays = await db('holidays').select('holiday_date', 'name');
  const holidayMap = new Map();
  holidays.forEach(h => {
    const dStr = typeof h.holiday_date === 'string' 
      ? h.holiday_date.split('T')[0] 
      : DateTime.fromJSDate(h.holiday_date).setZone(ZONE).toFormat('yyyy-MM-dd');
    holidayMap.set(dStr, h.name);
  });

  // 3. Periksa dan lengkapi presensi s/d hari ini (3 November 2026)
  const todayStr = '2026-11-03';
  let curAtt = DateTime.fromISO('2026-10-03', { zone: ZONE });
  const endAtt = DateTime.fromISO(todayStr, { zone: ZONE });
  const newAttendances = [];

  while (curAtt <= endAtt) {
    const dStr = curAtt.toFormat('yyyy-MM-dd');
    const dow = curAtt.weekday;
    const schedule = SCHEDULES[dow];

    if (schedule && schedule.isWorkday && !holidayMap.has(dStr)) {
      const existing = await db('attendances').where({ user_id: userId, work_date: dStr }).first();
      if (!existing) {
        const isHour6 = Math.random() < 0.4;
        const inHour = isHour6 ? 6 : 7;
        const inMin = isHour6 ? randomInt(45, 59) : randomInt(0, 30);
        const inSec = randomInt(0, 59);

        const checkInDt = curAtt.set({ hour: inHour, minute: inMin, second: inSec });
        const [endH, endM] = schedule.end.split(':').map(Number);
        const scheduledEndDt = curAtt.set({ hour: endH, minute: endM, second: 0 });

        const isOvertime = Math.random() < 0.45;
        const extraMinutes = isOvertime ? randomInt(15, 60) : randomInt(0, 4);
        const checkOutDt = scheduledEndDt.plus({ minutes: extraMinutes, seconds: randomInt(0, 59) });

        const overtimeMinutes = extraMinutes >= 15 ? extraMinutes : 0;
        const status = overtimeMinutes > 0 ? 'LEMBUR' : 'TEPAT_WAKTU';

        newAttendances.push({
          user_id: userId,
          work_date: dStr,
          check_in_at: checkInDt.toJSDate(),
          check_out_at: checkOutDt.toJSDate(),
          check_in_lat: randomFloat(BASE_LAT - 0.0003, BASE_LAT + 0.0003),
          check_in_lng: randomFloat(BASE_LNG - 0.0003, BASE_LNG + 0.0003),
          check_out_lat: randomFloat(BASE_LAT - 0.0003, BASE_LAT + 0.0003),
          check_out_lng: randomFloat(BASE_LNG - 0.0003, BASE_LNG + 0.0003),
          status,
          late_minutes: 0,
          overtime_minutes: overtimeMinutes,
          notes: null,
          is_manual: false,
          created_at: checkInDt.toJSDate(),
          updated_at: checkOutDt.toJSDate()
        });
      }
    }
    curAtt = curAtt.plus({ days: 1 });
  }

  if (newAttendances.length > 0) {
    await db('attendances').insert(newAttendances);
    console.log(`✅ Berhasil menambahkan ${newAttendances.length} presensi baru (Oktober - 3 November 2026).`);
  }

  // 4. Ambil seluruh data presensi user dari 1 Januari 2026 s/d hari ini
  const allAttendances = await db('attendances')
    .where('user_id', userId)
    .where('work_date', '>=', '2026-01-01')
    .where('work_date', '<=', todayStr)
    .orderBy('work_date', 'asc');

  console.log(`Total hari masuk (presensi) ditemukan: ${allAttendances.length} hari.`);

  // 5. Bersihkan data kegiatan sebelumnya di rentang tanggal tersebut
  const deletedActs = await db('activities')
    .where('user_id', userId)
    .where('activity_date', '>=', '2026-01-01')
    .where('activity_date', '<=', todayStr)
    .del();
  console.log(`Membersihkan ${deletedActs} data kegiatan lama.`);

  // 6. Generate kegiatan per hari presensi
  const activityRecords = [];
  let templateIndex = 0;

  for (const att of allAttendances) {
    const dateStr = att.work_date instanceof Date
      ? att.work_date.toISOString().split('T')[0]
      : String(att.work_date);

    // Ambil template kegiatan secara bergantian sehingga bervariasi di semua 13 lokasi
    const template = ACTIVITY_TEMPLATES[templateIndex % ACTIVITY_TEMPLATES.length];
    templateIndex++;

    // Jam kegiatan: biasanya mulai antara 08:30 - 09:30, durasi 1.5 - 2.5 jam
    const startHour = randomInt(8, 9);
    const startMinute = [0, 15, 30][randomInt(0, 2)];
    const durationMinutes = [60, 75, 90, 105, 120][randomInt(0, 4)];

    const actDate = DateTime.fromISO(dateStr, { zone: ZONE });
    const startDt = actDate.set({ hour: startHour, minute: startMinute });
    const endDt = startDt.plus({ minutes: durationMinutes });

    const startTimeStr = startDt.toFormat('HH:mm');
    const endTimeStr = endDt.toFormat('HH:mm');

    activityRecords.push({
      user_id: userId,
      activity_date: dateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      title: template.title,
      location: template.location,
      description: template.description,
      output: template.output,
      status: 'SELESAI',
      notes: template.notes,
      created_at: startDt.toJSDate(),
      updated_at: endDt.toJSDate()
    });
  }

  // 7. Simpan batch kegiatan ke database
  console.log(`\nMenyimpan ${activityRecords.length} kegiatan harian ke database...`);
  for (let i = 0; i < activityRecords.length; i += 50) {
    const batch = activityRecords.slice(i, i + 50);
    await db('activities').insert(batch);
    console.log(`  ✓ Batch ${Math.floor(i / 50) + 1} (${batch.length} kegiatan) tersimpan.`);
  }

  // 8. Rekapitulasi per bulan
  console.log('\n=== REKAPITULASI KEGIATAN HARIAN PER BULAN ===');
  const byMonth = {};
  activityRecords.forEach(r => {
    const m = r.activity_date.substring(0, 7);
    if (!byMonth[m]) byMonth[m] = { total: 0, selesai: 0 };
    byMonth[m].total++;
    byMonth[m].selesai++;
  });

  console.table(
    Object.entries(byMonth).map(([bulan, s]) => ({
      Bulan: bulan,
      'Total Kegiatan': s.total,
      'Status Selesai': s.selesai
    }))
  );

  // Rekapitulasi per lokasi
  console.log('\n=== DISTRIBUSI KEGIATAN PER LOKASI KEWENANGAN ===');
  const byLocation = {};
  activityRecords.forEach(r => {
    byLocation[r.location] = (byLocation[r.location] || 0) + 1;
  });
  console.table(
    Object.entries(byLocation).map(([loc, count]) => ({
      'Lokasi / Unit': loc,
      'Jumlah Kegiatan': count
    }))
  );

  console.log('\n🎉 SUKSES! Seluruh kegiatan harian telah berhasil dibuat dan disesuaikan 100% dengan tanggal masuk presensi.');
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

