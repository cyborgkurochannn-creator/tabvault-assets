/**
 * TABVAULT — Backend API untuk Dashboard Peminjaman Tablet
 * ----------------------------------------------------------
 * Sheet "Peminjaman" akan dibuat otomatis dengan kolom:
 * ID | Nama | Nomor Tab | Peminjaman | Kembali | SPV
 */
const SHEET_NAME = 'Peminjaman';
const DELETE_PASSWORD = 'spvhcij359';

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
    sheet.appendRow([id, body.nama, body.nomorTab, new Date(), '', '']);
    return respond({ success: true, id: id });
  }

  if (action === 'return') {
    if (!body.spv) {
      return respond({ success: false, error: 'Nama SPV wajib diisi' });
    }
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === body.id) {
        sheet.getRange(i + 1, 5).setValue(new Date());
        sheet.getRange(i + 1, 6).setValue(body.spv);
        return respond({ success: true });
      }
    }
    return respond({ success: false, error: 'Data tidak ditemukan' });
  }

  if (action === 'delete') {
    if (body.password !== DELETE_PASSWORD) {
      return respond({ success: false, error: 'Kata sandi salah' });
    }
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
    sheet.appendRow(['ID', 'Nama', 'Nomor Tab', 'Peminjaman', 'Kembali', 'SPV']);
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
      kembali: row[4] ? new Date(row[4]).toISOString() : '',
      spv: row[5] || ''
    });
  }
  rows.reverse();
  return rows;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
