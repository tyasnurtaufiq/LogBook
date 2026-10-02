const PDFDocument = require('pdfkit');
const { formatIndonesianDate, formatIndonesianTime, formatDurationMinutes, getNow } = require('../utils/time');

class PdfReportService {
  /**
   * Generates PDF stream using PDFKit
   * @param {Object} options
   * @param {Array} options.records - Array of attendance records
   * @param {Object} options.summary - Summary calculation metrics
   * @param {Object} options.companyInfo - Company and employee information
   * @param {string} options.startDate - YYYY-MM-DD
   * @param {string} options.endDate - YYYY-MM-DD
   * @param {stream.Writable} outputStream - Stream to pipe PDF into
   */
  static generatePdfBuffer({ records, summary, companyInfo, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          bufferPages: true
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const now = getNow();
    const primaryColor = '#1e3a8a'; // Dark slate blue
    const secondaryColor = '#475569'; // Slate 600
    const accentColor = '#0284c7'; // Sky 600
    const lightBg = '#f8fafc'; // Slate 50
    const borderColor = '#cbd5e1'; // Slate 300

    // --- 1. HEADER ---
    doc.fillColor(primaryColor)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text((companyInfo?.company_name || 'PT DIGITAL SOLUSI NUSANTARA').toUpperCase(), 40, 40);

    doc.fillColor(secondaryColor)
       .fontSize(10)
       .font('Helvetica')
       .text('SISTEM PRESENSI ELEKTRONIK (LOGBOOK) - LAPORAN KEHADIRAN KERJA', 40, 62);

    // Separator line
    doc.strokeColor(accentColor)
       .lineWidth(2)
       .moveTo(40, 78)
       .lineTo(555, 78)
       .stroke();

    // --- 2. REPORT METADATA INFO BOX ---
    doc.rect(40, 88, 515, 62)
       .fillAndStroke(lightBg, borderColor);

    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
    doc.text('Nama Karyawan', 52, 98);
    doc.text('NIK / Jabatan', 52, 114);
    doc.text('Periode Laporan', 52, 130);

    doc.font('Helvetica');
    doc.text(`: ${companyInfo?.employee_name || 'Tyas Nur Taufiq'}`, 140, 98);
    doc.text(`: ${companyInfo?.employee_nik || companyInfo?.employee_nip || '-'} / ${companyInfo?.department || 'Karyawan'}`, 140, 114);
    doc.text(`: ${formatIndonesianDate(startDate)} s/d ${formatIndonesianDate(endDate)}`, 140, 130);

    doc.font('Helvetica-Bold');
    doc.text('Tanggal Cetak', 360, 98);
    doc.text('Waktu Cetak', 360, 114);
    doc.text('Total Hari Kerja', 360, 130);

    doc.font('Helvetica');
    doc.text(`: ${formatIndonesianDate(now)}`, 435, 98);
    doc.text(`: ${formatIndonesianTime(now)} WIB`, 435, 114);
    doc.text(`: ${summary.totalDaysPresent} Hari Hadir`, 435, 130);

    // --- 3. ATTENDANCE TABLE ---
    const tableTop = 165;
    const colX = {
      no: 40,
      tanggal: 68,
      hari: 145,
      masuk: 210,
      pulang: 265,
      ket: 320,
      ttd: 480
    };

    // Table Header Background
    doc.rect(40, tableTop, 515, 20)
       .fill(primaryColor);

    // Table Header Texts
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
    doc.text('No', colX.no + 3, tableTop + 6);
    doc.text('Tanggal', colX.tanggal, tableTop + 6);
    doc.text('Hari', colX.hari, tableTop + 6);
    doc.text('Masuk', colX.masuk, tableTop + 6);
    doc.text('Pulang', colX.pulang, tableTop + 6);
    doc.text('Keterangan', colX.ket, tableTop + 6);
    doc.text('TTD', colX.ttd + 12, tableTop + 6);

    let y = tableTop + 20;

    // Rows
    records.forEach((row, index) => {
      // Check if page overflow
      if (y > 690) {
        doc.addPage();
        y = 50;

        // Re-draw header on new page
        doc.rect(40, y, 515, 20).fill(primaryColor);
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
        doc.text('No', colX.no + 3, y + 6);
        doc.text('Tanggal', colX.tanggal, y + 6);
        doc.text('Hari', colX.hari, y + 6);
        doc.text('Masuk', colX.masuk, y + 6);
        doc.text('Pulang', colX.pulang, y + 6);
        doc.text('Keterangan', colX.ket, y + 6);
        doc.text('TTD', colX.ttd + 12, y + 6);
        y += 20;
      }

      const rowHeight = 24;

      // Zebra striping
      if (index % 2 === 1) {
        doc.rect(40, y, 515, rowHeight).fill('#f8fafc');
      }

      // Cell border bottom
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, y + rowHeight).lineTo(555, y + rowHeight).stroke();
      // Vertical line separating TTD column
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(colX.ttd - 5, y).lineTo(colX.ttd - 5, y + rowHeight).stroke();

      const dateStr = row.work_date instanceof Date ? row.work_date.toISOString().split('T')[0] : String(row.work_date);
      const dateParts = dateStr.split('-');
      const formattedDateShort = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      const dayName = formatIndonesianDate(dateStr).split(',')[0];

      const checkInStr = row.check_in_at ? formatIndonesianTime(row.check_in_at) : '-';
      const checkOutStr = row.check_out_at ? formatIndonesianTime(row.check_out_at) : '-';
      const noteStr = row.notes ? (row.notes.length > 32 ? row.notes.substring(0, 32) + '...' : row.notes) : '-';

      doc.fillColor('#0f172a').fontSize(8).font('Helvetica');
      doc.text(String(index + 1), colX.no + 3, y + 8);
      doc.text(formattedDateShort, colX.tanggal, y + 8);
      doc.text(dayName, colX.hari, y + 8);
      doc.text(checkInStr, colX.masuk, y + 8);
      doc.text(checkOutStr, colX.pulang, y + 8);
      doc.text(noteStr, colX.ket, y + 8);
      // TTD column remains blank for manual signature/paraf

      y += rowHeight;
    });

    // Check if space for summary & signature
    if (y > 620) {
      doc.addPage();
      y = 50;
    }

    // --- 4. SUMMARY BOX ---
    y += 15;
    doc.rect(40, y, 515, 54)
       .fillAndStroke('#eff6ff', '#bfdbfe');

    doc.fillColor('#1e40af').fontSize(8.5).font('Helvetica-Bold');
    doc.text('RINGKASAN REKAPITULASI KEHADIRAN', 52, y + 8);

    doc.fillColor('#1e293b').fontSize(8).font('Helvetica');
    doc.text(`• Total Hadir: ${summary.totalDaysPresent} Hari`, 52, y + 24);
    doc.text(`• Total Terlambat: ${summary.totalLateCount} Kali (${formatDurationMinutes(summary.totalLateMinutes)})`, 52, y + 38);

    doc.text(`• Jumlah Jam Kerja: ${summary.totalWorkHoursFormatted || formatDurationMinutes(summary.totalWorkMinutes)}`, 220, y + 24);
    doc.text(`• Jumlah Izin (Hari): ${summary.totalIzinDays || 0} Hari`, 220, y + 38);

    doc.text(`• Rata-rata Masuk: ${summary.avgCheckInTime || '-'} WIB`, 380, y + 24);
    doc.text(`• Rata-rata Pulang: ${summary.avgCheckOutTime || '-'} WIB`, 380, y + 38);

    y += 75;

    // --- 5. SIGNATURE SECTION ---
    const signBoxY = y;
    doc.fontSize(8.5).font('Helvetica');

    // Employee sign
    doc.text('Karyawan yang bersangkutan,', 70, signBoxY);
    doc.text('( .................................................. )', 60, signBoxY + 55);
    doc.font('Helvetica-Bold').text(companyInfo?.employee_name || 'Tyas Nur Taufiq', 70, signBoxY + 68);

    // Approver sign
    doc.font('Helvetica').text('Mengetahui & Menyetujui,', 370, signBoxY);
    doc.text('( .................................................. )', 360, signBoxY + 55);
    doc.font('Helvetica-Bold').text(companyInfo?.approver_name || 'Ahmad Fauzi, M.T.', 370, signBoxY + 68);
    doc.font('Helvetica').fontSize(8).text(companyInfo?.approver_title || 'Engineering Director', 370, signBoxY + 80);

    // --- 6. PAGE NUMBERING ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#94a3b8')
         .fontSize(8)
         .font('Helvetica')
         .text(
           `Halaman ${i + 1} dari ${range.count} • Dicetak otomatis oleh LogBook Personal System`,
           40,
           800,
           { align: 'center', width: 515 }
         );
    }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  static async generatePdfReport(options, outputStream) {
    const buffer = await this.generatePdfBuffer(options);
    outputStream.end(buffer);
  }

  /**
   * Generates CSV string for export
   */
  static generateCsvReport(options) {
    let records = [];
    let summary = null;
    let companyInfo = null;
    let startDate = null;
    let endDate = null;

    if (Array.isArray(options)) {
      records = options;
    } else if (options && typeof options === 'object') {
      records = options.records || [];
      summary = options.summary || null;
      companyInfo = options.companyInfo || null;
      startDate = options.startDate || null;
      endDate = options.endDate || null;
    }

    const employeeName = companyInfo?.employee_name || 'Tyas Nur Taufiq';
    const employeeNik = companyInfo?.employee_nik || companyInfo?.employee_nip || '-';
    const companyName = companyInfo?.company_name || 'PT DIGITAL SOLUSI NUSANTARA';
    const department = companyInfo?.department || 'Karyawan';

    // Metadata lines
    const metadataLines = [
      `"LAPORAN REKAPITULASI PRESENSI - ${companyName}"`,
      `"Nama Karyawan","${employeeName}"`,
      `"NIK","'${employeeNik}"`,
      `"Divisi / Jabatan","${department}"`,
      startDate && endDate ? `"Periode","${startDate} s/d ${endDate}"` : '',
      ''
    ].filter(Boolean);

    // Headers with "Jumlah Jam Kerja" replacing "Menit Lembur"
    const headers = [
      'No',
      'Tanggal',
      'Hari',
      'Jam Masuk',
      'Jam Pulang',
      'Jumlah Jam Kerja',
      'Status',
      'Menit Terlambat',
      'Koreksi Manual',
      'Keterangan'
    ];

    const rows = records.map((r, i) => {
      const dateStr = r.work_date instanceof Date ? r.work_date.toISOString().split('T')[0] : String(r.work_date);
      const dayName = formatIndonesianDate(dateStr).split(',')[0];
      const checkIn = r.check_in_at ? formatIndonesianTime(r.check_in_at) : '';
      const checkOut = r.check_out_at ? formatIndonesianTime(r.check_out_at) : '';
      const notesClean = (r.notes || '').replace(/"/g, '""');

      let durationStr = '-';
      if (r.check_in_at && r.check_out_at) {
        const startMs = new Date(r.check_in_at).getTime();
        const endMs = new Date(r.check_out_at).getTime();
        const diffMins = Math.max(0, Math.floor((endMs - startMs) / 60000));
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        durationStr = `${h} jam ${m} mnt`;
      }

      return [
        i + 1,
        dateStr,
        dayName,
        checkIn,
        checkOut,
        `"${durationStr}"`,
        r.status,
        r.late_minutes,
        r.is_manual ? 'Ya' : 'Tidak',
        `"${notesClean}"`
      ].join(',');
    });

    let summaryLines = [];
    if (summary) {
      summaryLines = [
        '',
        '"--- RINGKASAN REKAPITULASI KEHADIRAN ---"',
        `"Total Hari Hadir","${summary.totalDaysPresent} Hari"`,
        `"Jumlah Jam Kerja","${summary.totalWorkHoursFormatted || formatDurationMinutes(summary.totalWorkMinutes || 0)}"`,
        `"Jumlah Izin (Hari)","${summary.totalIzinDays || 0} Hari"`,
        `"Total Terlambat","${summary.totalLateCount || 0} Kali (${formatDurationMinutes(summary.totalLateMinutes || 0)})"`,
        `"Rata-rata Jam Masuk","${summary.avgCheckInTime || '-'} WIB"`,
        `"Rata-rata Jam Pulang","${summary.avgCheckOutTime || '-'} WIB"`
      ];
    }

    return [...metadataLines, headers.join(','), ...rows, ...summaryLines].join('\r\n');
  }

  /**
   * Generates formatted HTML report for browser print / Save as PDF
   */
  static generateHtmlReport({ records, summary, companyInfo, startDate, endDate, autoPrint = true }) {
    const now = getNow();
    const companyName = (companyInfo?.company_name || 'PT DIGITAL SOLUSI NUSANTARA').toUpperCase();
    const employeeName = companyInfo?.employee_name || 'Tyas Nur Taufiq';
    const employeeNik = companyInfo?.employee_nik || companyInfo?.employee_nip || '-';
    const department = companyInfo?.department || 'Karyawan';
    const approverName = companyInfo?.approver_name || 'Ahmad Fauzi, M.T.';
    const approverTitle = companyInfo?.approver_title || 'Engineering Director';

    const rowsHtml = records.map((row, index) => {
      const dateStr = row.work_date instanceof Date ? row.work_date.toISOString().split('T')[0] : String(row.work_date);
      const parts = dateStr.split('-');
      const formattedDateShort = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
      const dayName = formatIndonesianDate(dateStr).split(',')[0];

      const checkInStr = row.check_in_at ? formatIndonesianTime(row.check_in_at) : '—';
      const checkOutStr = row.check_out_at ? formatIndonesianTime(row.check_out_at) : '—';

      const noteStr = row.notes ? row.notes.replace(/^\[Koreksi Manual\]\s*/, '') : '—';
      const isManualStr = row.is_manual ? ' <small class="text-muted">(Manual)</small>' : '';

      return `
        <tr class="${index % 2 === 1 ? 'even-row' : ''}">
          <td class="text-center text-mono">${index + 1}</td>
          <td class="text-mono">${formattedDateShort}</td>
          <td>${dayName}</td>
          <td class="text-center text-mono font-medium">${checkInStr}</td>
          <td class="text-center text-mono font-medium">${checkOutStr}</td>
          <td class="note-col">${noteStr}${isManualStr}</td>
          <td class="ttd-cell"></td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan_Presensi_${startDate}_sd_${endDate}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      font-size: 11px;
      line-height: 1.4;
      padding-bottom: 40px;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    .no-print-bar .title {
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .no-print-bar .btn-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }
    .btn-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .report-sheet {
      max-width: 210mm;
      margin: 20px auto;
      background: #ffffff;
      padding: 20mm 20mm;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
    }
    .company-header h1 {
      font-size: 18px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.2px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .company-header p {
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, #0284c7, #38bdf8);
      margin: 8px 0 14px 0;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .info-table td {
      padding: 2px 0;
    }
    .info-table td.label {
      width: 110px;
      font-weight: 600;
      color: #475569;
    }
    .info-table td.val {
      color: #0f172a;
      font-weight: 500;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      margin-bottom: 16px;
    }
    table.data-table th {
      background: #1e3a8a;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border: 1px solid #1e3a8a;
      text-align: left;
    }
    table.data-table td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      height: 32px;
      vertical-align: middle;
    }
    table.data-table td.ttd-cell {
      width: 90px;
      background: #fafafa;
    }
    table.data-table tr.even-row {
      background-color: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-mono { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
    .font-medium { font-weight: 600; }
    .note-col { word-break: break-word; }
    .text-muted { color: #94a3b8; font-size: 8.5px; }
    .badge {
      display: inline-block;
      padding: 1.5px 6px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-info { background: #e0e7ff; color: #4338ca; }
    .badge-neutral { background: #f1f5f9; color: #64748b; }
    .summary-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .summary-title {
      font-size: 10px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px 14px;
      font-size: 9.5px;
    }
    .summary-item {
      color: #1e293b;
    }
    .summary-item strong {
      color: #0f172a;
    }
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .signature-col {
      text-align: center;
    }
    .signature-title {
      font-size: 10px;
      color: #475569;
      margin-bottom: 55px;
    }
    .signature-line {
      font-weight: 700;
      font-size: 11px;
      color: #0f172a;
      border-bottom: 1px solid #475569;
      display: inline-block;
      min-width: 170px;
      padding-bottom: 2px;
    }
    .signature-role {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 3px;
    }
    .report-footer {
      margin-top: 25px;
      font-size: 8.5px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
    @media print {
      .no-print, .no-print-bar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .report-sheet {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
      }
      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar no-print">
    <div class="title">
      <span>📄 Pratinjau Laporan Presensi (${startDate} s/d ${endDate})</span>
    </div>
    <div class="btn-group">
      <button onclick="window.print()" class="btn btn-print">
        🖨️ Cetak / Simpan ke PDF
      </button>
      <button onclick="window.close()" class="btn btn-close">
        ✖️ Tutup
      </button>
    </div>
  </div>

  <div class="report-sheet">
    <div class="company-header">
      <h1>${companyName}</h1>
      <p>SISTEM PRESENSI ELEKTRONIK (LOGBOOK) &bull; LAPORAN KEHADIRAN KERJA KARYAWAN</p>
    </div>

    <div class="divider"></div>

    <div class="info-box">
      <table class="info-table">
        <tr>
          <td class="label">Nama Karyawan</td>
          <td class="val">: ${employeeName}</td>
        </tr>
        <tr>
          <td class="label">NIK / Divisi</td>
          <td class="val">: ${employeeNik} / ${department}</td>
        </tr>
        <tr>
          <td class="label">Periode Laporan</td>
          <td class="val">: ${formatIndonesianDate(startDate)} s/d ${formatIndonesianDate(endDate)}</td>
        </tr>
      </table>

      <table class="info-table">
        <tr>
          <td class="label">Tanggal Cetak</td>
          <td class="val">: ${formatIndonesianDate(now)}</td>
        </tr>
        <tr>
          <td class="label">Waktu Cetak</td>
          <td class="val">: ${formatIndonesianTime(now)} WIB</td>
        </tr>
        <tr>
          <td class="label">Total Hari Kerja</td>
          <td class="val">: <strong>${summary.totalDaysPresent} Hari Hadir</strong></td>
        </tr>
      </table>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 30px;" class="text-center">No</th>
          <th style="width: 80px;">Tanggal</th>
          <th style="width: 70px;">Hari</th>
          <th style="width: 65px;" class="text-center">Masuk</th>
          <th style="width: 65px;" class="text-center">Pulang</th>
          <th>Keterangan</th>
          <th style="width: 90px;" class="text-center">TTD</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="7" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data kehadiran pada periode ini</td></tr>'}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-title">Ringkasan Rekapitulasi Kehadiran</div>
      <div class="summary-grid">
        <div class="summary-item">&bull; Total Hadir: <strong>${summary.totalDaysPresent} Hari</strong></div>
        <div class="summary-item">&bull; Jumlah Jam Kerja: <strong>${summary.totalWorkHoursFormatted || formatDurationMinutes(summary.totalWorkMinutes || 0)}</strong></div>
        <div class="summary-item">&bull; Rata-rata Masuk: <strong>${summary.avgCheckInTime || '—'} WIB</strong></div>
        <div class="summary-item">&bull; Total Terlambat: <strong>${summary.totalLateCount}x (${formatDurationMinutes(summary.totalLateMinutes)})</strong></div>
        <div class="summary-item">&bull; Jumlah Izin (Hari): <strong>${summary.totalIzinDays || 0} Hari</strong></div>
        <div class="summary-item">&bull; Rata-rata Pulang: <strong>${summary.avgCheckOutTime || '—'} WIB</strong></div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-col">
        <div class="signature-title">Karyawan yang bersangkutan,</div>
        <div class="signature-line">${employeeName}</div>
        <div class="signature-role">Karyawan / ${department}</div>
      </div>
      <div class="signature-col">
        <div class="signature-title">Mengetahui & Menyetujui,</div>
        <div class="signature-line">${approverName}</div>
        <div class="signature-role">${approverTitle}</div>
      </div>
    </div>

    <div class="report-footer">
      Dicetak secara otomatis melalui Sistem LogBook &bull; Dokumen sah rekapitulasi kehadiran kerja
    </div>
  </div>

  ${autoPrint ? `
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
  ` : ''}
</body>
</html>`;
  }
}

module.exports = PdfReportService;
