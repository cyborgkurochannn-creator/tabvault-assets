/**
 * TABVAULT — Backend API untuk Dashboard Peminjaman Tablet
 * ----------------------------------------------------------
 * Cara pakai:
 * 1. Buat Google Spreadsheet baru (boleh kosong).
 * 2. Buka Extensions > Apps Script, hapus isi default, tempel file ini.
 * 3. Klik Deploy > New deployment > pilih "Web app".
 *    - Execute as     : Me
 *    - Who has access : Anyone
 * 4. Salin URL yang berakhiran /exec, itu adalah API_URL untuk frontend.
 *
 * Sheet "Peminjaman" akan dibuat otomatis dengan kolom:
 * ID | Nama | Nomor Tab | Peminjaman | Kembali
 */

const SHEET_NAME = 'Peminjaman';

function doGet(e) {
  const action = (e.parameter.action || 'list');
  if (action === 'list') {
    return respond({ success: true, data: getAllData() });
  }
  return respond({ success: false, error: 'Aksi tidak dikenal' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ success: false, error: 'Body tidak valid' });
  }

  const action = body.action;
  const sheet = getSheet();

  if (action === 'borrow') {
    if (!body.nama || !body.nomorTab) {
      return respond({ success: false, error: 'Nama dan Nomor Tab wajib diisi' });
    }
    const id = Utilities.getUuid();
    sheet.appendRow([id, body.nama, body.nomorTab, new Date(), '']);
    return respond({ success: true, id: id });
  }

  if (action === 'return') {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === body.id) {
        sheet.getRange(i + 1, 5).setValue(new Date());
        return respond({ success: true });
      }
    }
    return respond({ success: false, error: 'Data tidak ditemukan' });
  }

  if (action === 'delete') {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === body.id) {
        sheet.deleteRow(i + 1);
        return respond({ success: true });
      }
    }
    return respond({ success: false, error: 'Data tidak ditemukan' });
  }

  return respond({ success: false, error: 'Aksi tidak dikenal' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID', 'Nama', 'Nomor Tab', 'Peminjaman', 'Kembali']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getAllData() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    rows.push({
      id: row[0],
      nama: row[1],
      nomorTab: row[2],
      peminjaman: row[3] ? new Date(row[3]).toISOString() : '',
      kembali: row[4] ? new Date(row[4]).toISOString() : ''
    });
  }
  // Terbaru di atas
  rows.reverse();
  return rows;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
