import api from '../services/api';

/**
 * Helper to download report files (PDF / CSV).
 * Uses Axios with responseType: 'blob' which integrates with auth interceptors
 * and handles token refresh automatically.
 *
 * @param {string} endpoint - e.g. '/reports/pdf' or '/reports/csv'
 * @param {Object} params   - Query parameters like { from, to, month }
 * @param {'pdf' | 'csv'} type - File type
 */
export async function downloadReportFile(endpoint, params = {}, type = 'pdf') {
  // 1. Normalize endpoint
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  } else if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = '/' + cleanEndpoint;
  }

  const mimeType = type === 'pdf' ? 'application/pdf' : 'text/csv; charset=utf-8';
  const defaultFilename = `Laporan_Presensi_${new Date().toISOString().split('T')[0]}.${type}`;

  try {
    const response = await api.get(cleanEndpoint, {
      params: {
        ...params,
        _t: Date.now()
      },
      responseType: 'blob'
    });

    const blobData = response.data;
    if (!blobData || blobData.size === 0) {
      throw new Error('File hasil generate kosong (0 byte). Silakan periksa data presensi Anda.');
    }

    // Determine filename from Content-Disposition header
    let filename = defaultFilename;
    const disposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) filename = match[1].replace(/['"]/g, '').trim();
    }
    if (!filename.toLowerCase().endsWith(`.${type}`)) filename += `.${type}`;

    // Create a Blob and trigger the download link
    const blob = new Blob([blobData], { type: mimeType });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 30000);

    return { success: true, filename, size: blobData.size };
  } catch (err) {
    // If the server responded with an error, the error response is a Blob containing JSON
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        if (json?.message) {
          throw new Error(json.message);
        }
      } catch (parseErr) {
        if (parseErr.message && !parseErr.message.includes('JSON')) {
          throw parseErr;
        }
      }
    }
    throw err;
  }
}

/**
 * Opens printable HTML report in a new browser tab/window
 * which auto-triggers the print dialog (for Save as PDF or physical print).
 *
 * @param {Object} params - { from, to, month, autoprint }
 */
export async function openReportPrint(params = {}) {
  // Proactively verify / refresh token before opening the print tab
  try {
    await api.get('/auth/me');
  } catch (err) {
    const currentToken = localStorage.getItem('epres_access_token');
    if (!currentToken) {
      const error = new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      error.isSessionExpired = true;
      throw error;
    }
  }

  const token = localStorage.getItem('epres_access_token');
  const allParams = { ...params, _t: Date.now() };
  if (token) allParams.token = token;

  const queryString = Object.entries(allParams)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const apiBase = (api.defaults.baseURL || '/api').replace(/\/+$/, '');
  const url = `${apiBase}/reports/html?${queryString}`;
  const win = window.open(url, '_blank');
  if (!win) {
    window.location.href = url;
  }
  return true;
}


