const PDFDocument = require('pdfkit');
const { formatIndonesianDate, formatIndonesianTime, getNow } = require('../utils/time');

class ActivityReportService {
  /**
   * Generates PDF stream/buffer for Activity Report using PDFKit
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
        const primaryColor = '#1e3a8a';   // Indigo/navy 900
        const secondaryColor = '#475569'; // Slate 600
        const accentColor = '#6366f1';    // Indigo 500
        const lightBg = '#f8fafc';        // Slate 50
        const borderColor = '#cbd5e1';    // Slate 300

        // --- 1. HEADER ---
        doc.fillColor(primaryColor)
           .fontSize(17)
           .font('Helvetica-Bold')
           .text((companyInfo?.company_name || 'PT DIGITAL SOLUSI NUSANTARA').toUpperCase(), 40, 40);

        doc.fillColor(secondaryColor)
           .fontSize(10)
           .font('Helvetica')
           .text('SISTEM LOGBOOK - LAPORAN KEGIATAN HARIAN (DAILY WORK LOG)', 40, 62);

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
        doc.text('Total Kegiatan', 360, 130);

        doc.font('Helvetica');
        doc.text(`: ${formatIndonesianDate(now)}`, 435, 98);
        doc.text(`: ${formatIndonesianTime(now)} WIB`, 435, 114);
        doc.text(`: ${records.length} Kegiatan Tercatat`, 435, 130);

        // --- 3. ACTIVITIES TABLE ---
        const tableTop = 165;
        const colX = {
          no: 40,
          tanggal: 64,
          waktu: 126,
          kegiatan: 182,
          lokasi: 324,
          output: 406,
          status: 498
        };

        const drawTableHeader = (yPos) => {
          doc.rect(40, yPos, 515, 20).fill(primaryColor);
          doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
          doc.text('No', colX.no + 3, yPos + 6);
          doc.text('Tanggal', colX.tanggal, yPos + 6);
          doc.text('Waktu', colX.waktu, yPos + 6);
          doc.text('Uraian Kegiatan', colX.kegiatan, yPos + 6);
          doc.text('Lokasi / Bagian', colX.lokasi, yPos + 6);
          doc.text('Hasil / Output', colX.output, yPos + 6);
          doc.text('Status', colX.status + 5, yPos + 6);
        };

        drawTableHeader(tableTop);

        let y = tableTop + 20;

        records.forEach((row, index) => {
          const rowHeight = 28;

          // Check for page overflow
          if (y + rowHeight > 680) {
            doc.addPage();
            y = 50;
            drawTableHeader(y);
            y += 20;
          }

          // Zebra striping
          if (index % 2 === 1) {
            doc.rect(40, y, 515, rowHeight).fill('#f8fafc');
          }

          // Bottom border
          doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, y + rowHeight).lineTo(555, y + rowHeight).stroke();

          const dateStr = row.activity_date instanceof Date
            ? row.activity_date.toISOString().split('T')[0]
            : String(row.activity_date);
          const dateParts = dateStr.split('-');
          const formattedDateShort = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateStr;

          const waktuStr = (row.start_time || row.end_time)
            ? `${row.start_time || '--:--'} - ${row.end_time || '--:--'}`
            : '-';

          const titleStr = row.title ? (row.title.length > 36 ? row.title.substring(0, 36) + '...' : row.title) : '-';
          const locStr = row.location ? (row.location.length > 18 ? row.location.substring(0, 18) + '...' : row.location) : '-';
          const outStr = row.output ? (row.output.length > 20 ? row.output.substring(0, 20) + '...' : row.output) : '-';
          const statusStr = (row.status || 'SELESAI').toUpperCase();

          doc.fillColor('#0f172a').fontSize(8).font('Helvetica');
          doc.text(String(index + 1), colX.no + 3, y + 8);
          doc.text(formattedDateShort, colX.tanggal, y + 8);
          doc.text(waktuStr, colX.waktu, y + 8);

          doc.font('Helvetica-Bold').text(titleStr, colX.kegiatan, y + 8);
          doc.font('Helvetica');
          if (row.description && row.description.length > 0) {
            const descShort = row.description.length > 40 ? row.description.substring(0, 40) + '...' : row.description;
            doc.fontSize(7).fillColor('#64748b').text(descShort, colX.kegiatan, y + 17);
          }

          doc.fontSize(8).fillColor('#0f172a');
          doc.text(locStr, colX.lokasi, y + 8);
          doc.text(outStr, colX.output, y + 8);

          // Status Badge text
          if (statusStr === 'SELESAI') {
            doc.fillColor('#15803d').font('Helvetica-Bold').text('Selesai', colX.status + 5, y + 8);
          } else if (statusStr === 'PROSES') {
            doc.fillColor('#b45309').font('Helvetica-Bold').text('Proses', colX.status + 5, y + 8);
          } else {
            doc.fillColor('#64748b').font('Helvetica-Bold').text(statusStr, colX.status + 5, y + 8);
          }

          y += rowHeight;
        });

        // Check if space for summary & signature
        if (y > 620) {
          doc.addPage();
          y = 50;
        }

        // --- 4. SUMMARY BOX ---
        y += 15;
        doc.rect(40, y, 515, 48)
           .fillAndStroke('#eff6ff', '#bfdbfe');

        doc.fillColor('#1e40af').fontSize(8.5).font('Helvetica-Bold');
        doc.text('RINGKASAN REKAPITULASI KEGIATAN HARIAN', 52, y + 8);

        doc.fillColor('#1e293b').fontSize(8).font('Helvetica');
        const selesaiCount = summary?.completedCount ?? records.filter(r => (r.status || '').toUpperCase() === 'SELESAI').length;
        const prosesCount = summary?.inProgressCount ?? records.filter(r => (r.status || '').toUpperCase() === 'PROSES').length;
        const pendingCount = summary?.pendingCount ?? records.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

        doc.text(`• Total Kegiatan: ${records.length} Item`, 52, y + 24);
        doc.text(`• Status Selesai: ${selesaiCount} Kegiatan`, 52, y + 36);

        doc.text(`• Status Proses: ${prosesCount} Kegiatan`, 220, y + 24);
        doc.text(`• Status Pending: ${pendingCount} Kegiatan`, 220, y + 36);

        doc.text(`• Hari Aktif Kerja: ${summary?.totalActiveDays || '-'} Hari`, 380, y + 24);

        y += 68;

        // --- 5. SIGNATURE SECTION ---
        const signBoxY = y;
        doc.fontSize(8.5).font('Helvetica');

        // Employee sign
        doc.text('Karyawan yang bersangkutan,', 70, signBoxY);
        doc.text('( .................................................. )', 60, signBoxY + 55);
        doc.font('Helvetica-Bold').text(companyInfo?.employee_name || 'Tyas Nur Taufiq', 70, signBoxY + 68);
        doc.font('Helvetica').fontSize(8).text(companyInfo?.department || 'Karyawan', 70, signBoxY + 80);

        // Approver sign
        doc.font('Helvetica').fontSize(8.5).text('Mengetahui & Menyetujui,', 370, signBoxY);
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

  /**
   * Generates CSV string for activity export
   */
  static generateCsvReport({ records, summary, companyInfo, startDate, endDate }) {
    const employeeName = companyInfo?.employee_name || 'Tyas Nur Taufiq';
    const employeeNik = companyInfo?.employee_nik || companyInfo?.employee_nip || '-';
    const companyName = companyInfo?.company_name || 'PT DIGITAL SOLUSI NUSANTARA';
    const department = companyInfo?.department || 'Karyawan';

    const metadataLines = [
      `"LAPORAN REKAPITULASI KEGIATAN HARIAN - ${companyName}"`,
      `"Nama Karyawan","${employeeName}"`,
      `"NIK","'${employeeNik}"`,
      `"Divisi / Bagian","${department}"`,
      startDate && endDate ? `"Periode","${startDate} s/d ${endDate}"` : '',
      ''
    ].filter(Boolean);

    const headers = [
      'No',
      'Tanggal',
      'Hari',
      'Jam Mulai',
      'Jam Selesai',
      'Nama Kegiatan',
      'Lokasi / Sub Bagian',
      'Deskripsi / Rincian',
      'Hasil / Output',
      'Status',
      'Catatan'
    ];

    const rows = records.map((r, i) => {
      const dateStr = r.activity_date instanceof Date ? r.activity_date.toISOString().split('T')[0] : String(r.activity_date);
      const dayName = formatIndonesianDate(dateStr).split(',')[0];
      const titleClean = (r.title || '').replace(/"/g, '""');
      const locClean = (r.location || '').replace(/"/g, '""');
      const descClean = (r.description || '').replace(/"/g, '""');
      const outputClean = (r.output || '').replace(/"/g, '""');
      const notesClean = (r.notes || '').replace(/"/g, '""');

      return [
        i + 1,
        dateStr,
        dayName,
        r.start_time || '',
        r.end_time || '',
        `"${titleClean}"`,
        `"${locClean}"`,
        `"${descClean}"`,
        `"${outputClean}"`,
        r.status || 'SELESAI',
        `"${notesClean}"`
      ].join(',');
    });

    const selesaiCount = summary?.completedCount ?? records.filter(r => (r.status || '').toUpperCase() === 'SELESAI').length;
    const prosesCount = summary?.inProgressCount ?? records.filter(r => (r.status || '').toUpperCase() === 'PROSES').length;
    const pendingCount = summary?.pendingCount ?? records.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

    const summaryLines = [
      '',
      '"--- RINGKASAN REKAPITULASI KEGIATAN ---"',
      `"Total Kegiatan","${records.length} Kegiatan"`,
      `"Status Selesai","${selesaiCount} Kegiatan"`,
      `"Status Proses","${prosesCount} Kegiatan"`,
      `"Status Pending","${pendingCount} Kegiatan"`
    ];

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

    const selesaiCount = summary?.completedCount ?? records.filter(r => (r.status || '').toUpperCase() === 'SELESAI').length;
    const prosesCount = summary?.inProgressCount ?? records.filter(r => (r.status || '').toUpperCase() === 'PROSES').length;
    const pendingCount = summary?.pendingCount ?? records.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

    const rowsHtml = records.map((row, index) => {
      const dateStr = row.activity_date instanceof Date ? row.activity_date.toISOString().split('T')[0] : String(row.activity_date);
      const parts = dateStr.split('-');
      const formattedDateShort = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
      const dayName = formatIndonesianDate(dateStr).split(',')[0];

      const waktuStr = (row.start_time || row.end_time)
        ? `${row.start_time || '--:--'} - ${row.end_time || '--:--'}`
        : '—';

      const titleStr = row.title || '—';
      const descHtml = row.description ? `<div class="text-muted" style="margin-top:2px;">${row.description}</div>` : '';
      const locStr = row.location || '—';
      const outputStr = row.output || '—';

      let statusBadge = '<span class="badge badge-success">Selesai</span>';
      const st = (row.status || '').toUpperCase();
      if (st === 'PROSES' || st === 'DALAM_PROSES') {
        statusBadge = '<span class="badge badge-warning">Proses</span>';
      } else if (st === 'PENDING') {
        statusBadge = '<span class="badge badge-neutral">Pending</span>';
      }

      return `
        <tr class="${index % 2 === 1 ? 'even-row' : ''}">
          <td class="text-center text-mono">${index + 1}</td>
          <td class="text-mono">${formattedDateShort}</td>
          <td>${dayName}</td>
          <td class="text-center text-mono font-medium">${waktuStr}</td>
          <td>
            <strong>${titleStr}</strong>
            ${descHtml}
          </td>
          <td>${locStr}</td>
          <td>${outputStr}</td>
          <td class="text-center">${statusBadge}</td>
          <td class="ttd-cell"></td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan_Kegiatan_${startDate}_sd_${endDate}</title>
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
      font-size: 10px;
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
      background: #4f46e5;
      color: #ffffff;
    }
    .btn-print:hover {
      background: #4338ca;
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
      padding: 18mm 18mm;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
    }
    .company-header h1 {
      font-size: 17px;
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
      background: linear-gradient(to right, #4f46e5, #06b6d4);
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
      font-size: 9.5px;
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
      font-size: 9px;
      margin-bottom: 16px;
    }
    table.data-table th {
      background: #1e3a8a;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.5px;
      padding: 6px 7px;
      border: 1px solid #1e3a8a;
      text-align: left;
    }
    table.data-table td {
      padding: 6px 7px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      vertical-align: middle;
    }
    table.data-table td.ttd-cell {
      width: 50px;
      background: #fafafa;
    }
    table.data-table tr.even-row {
      background-color: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-mono { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
    .font-medium { font-weight: 600; }
    .text-muted { color: #64748b; font-size: 8px; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #b45309; }
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
      font-size: 9.5px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 12px;
      font-size: 9px;
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
      font-size: 9.5px;
      color: #475569;
      margin-bottom: 50px;
    }
    .signature-line {
      font-weight: 700;
      font-size: 10.5px;
      color: #0f172a;
      border-bottom: 1px solid #475569;
      display: inline-block;
      min-width: 170px;
      padding-bottom: 2px;
    }
    .signature-role {
      font-size: 9px;
      color: #64748b;
      margin-top: 3px;
    }
    .report-footer {
      margin-top: 25px;
      font-size: 8px;
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
      <span>📄 Pratinjau Laporan Kegiatan Harian (${startDate} s/d ${endDate})</span>
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
      <p>SISTEM LOGBOOK &bull; LAPORAN KEGIATAN HARIAN KARYAWAN</p>
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
          <td class="label">Total Kegiatan</td>
          <td class="val">: <strong>${records.length} Kegiatan Tercatat</strong></td>
        </tr>
      </table>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25px;" class="text-center">No</th>
          <th style="width: 70px;">Tanggal</th>
          <th style="width: 55px;">Hari</th>
          <th style="width: 70px;" class="text-center">Waktu</th>
          <th>Uraian Kegiatan</th>
          <th style="width: 110px;">Lokasi / Bagian</th>
          <th style="width: 110px;">Hasil / Output</th>
          <th style="width: 60px;" class="text-center">Status</th>
          <th style="width: 50px;" class="text-center">Paraf</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="9" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data kegiatan pada periode ini</td></tr>'}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-title">Ringkasan Rekapitulasi Kegiatan</div>
      <div class="summary-grid">
        <div class="summary-item">&bull; Total Kegiatan: <strong>${records.length} Item</strong></div>
        <div class="summary-item">&bull; Selesai: <strong>${selesaiCount} Item</strong></div>
        <div class="summary-item">&bull; Proses: <strong>${prosesCount} Item</strong></div>
        <div class="summary-item">&bull; Pending: <strong>${pendingCount} Item</strong></div>
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
      Dicetak secara otomatis melalui Sistem LogBook &bull; Dokumen sah rekapitulasi kegiatan harian
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

module.exports = ActivityReportService;

