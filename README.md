# TABVAULT — Dashboard Peminjaman Tablet

Dashboard elegan untuk mencatat siapa meminjam tablet nomor berapa, kapan dipinjam, dan kapan kembali.
Stack: **Google Sheets** (database) + **Google Apps Script** (API) + **GitHub + Vercel** (hosting frontend).

Isi folder ini:
```
Code.gs        -> tempel ke Google Apps Script (backend/API)
index.html     -> frontend dashboard, di-deploy ke Vercel
vercel.json    -> konfigurasi Vercel
README.md      -> panduan ini
```

---

## 1. Siapkan Google Sheet + Apps Script (Backend)

1. Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru, beri nama misalnya **"Data Peminjaman Tab"**. Bisa dikosongkan, sheet akan dibuat otomatis oleh script.
2. Di menu, klik **Extensions (Ekstensi) → Apps Script**.
3. Hapus semua isi editor default, lalu tempel seluruh isi file **`Code.gs`**.
4. Klik **Save** (ikon disket / Ctrl+S).
5. Klik **Deploy → New deployment**.
   - Klik ikon gear ⚙️ di samping "Select type" → pilih **Web app**.
   - **Execute as**: `Me (email kamu)`
   - **Who has access**: `Anyone`
   - Klik **Deploy**.
6. Google akan minta izin akses (Authorize access) — izinkan dengan akun Google kamu.
7. Setelah deploy selesai, salin **Web app URL** yang bentuknya seperti:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   Ini adalah `API_URL` kamu.

> Catatan: setiap kali kamu **mengedit ulang** `Code.gs`, kamu harus buat **New deployment** lagi (atau Manage deployments → Edit → New version) agar perubahan aktif.

---

## 2. Hubungkan Frontend ke API

1. Buka file **`index.html`**.
2. Cari baris ini di bagian bawah (dalam tag `<script>`):
   ```js
   const API_URL = 'GANTI_DENGAN_URL_WEB_APP_APPS_SCRIPT';
   ```
3. Ganti dengan URL `/exec` yang kamu salin tadi, contoh:
   ```js
   const API_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Simpan file.

---

## 3. Upload ke GitHub

1. Buat repository baru di GitHub, misalnya `tabvault-dashboard`.
2. Di komputer kamu, di dalam folder ini, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TABVAULT dashboard"
   git branch -M main
   git remote add origin https://github.com/USERNAME/tabvault-dashboard.git
   git push -u origin main
   ```
   (Ganti `USERNAME` dan nama repo sesuai milikmu.)

---

## 4. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → login dengan akun GitHub kamu.
2. Klik **Add New → Project**.
3. Pilih repository `tabvault-dashboard` yang baru kamu push.
4. Framework preset: pilih **Other** (karena ini static HTML, tidak perlu build command apa pun).
5. Klik **Deploy**.
6. Tunggu ~30 detik, Vercel akan memberi URL publik seperti:
   ```
   https://tabvault-dashboard.vercel.app
   ```
7. Buka URL itu — dashboard TABVAULT sudah live dan terhubung ke Google Sheet kamu.

Setiap kali kamu `git push` perubahan baru ke `main`, Vercel akan otomatis re-deploy.

---

## Cara Kerja Data

- Setiap entri di form **"Catat Peminjaman Baru"** akan menambah baris baru di sheet `Peminjaman` dengan kolom: `ID | Nama | Nomor Tab | Peminjaman | Kembali`.
- Kolom **Kembali** kosong berarti tablet masih dipinjam (badge oranye "Dipinjam").
- Klik **"Tandai Kembali"** di dashboard untuk mengisi kolom Kembali dengan waktu saat ini (badge hijau "Kembali").
- Dashboard auto-refresh setiap 15 detik, dan ada kolom pencarian nama/nomor tab.
- Semua data asli tetap tersimpan rapi di Google Sheet — bisa dibuka, difilter, atau dibuat laporan tambahan langsung dari Sheets kapan saja.

## Kustomisasi Cepat

- **Warna & tema**: semua warna diatur lewat CSS variable di bagian `:root` pada `index.html` (`--gold`, `--sage`, `--copper`, dst).
- **Nama dashboard**: ubah teks di dalam `<h1>TABVAULT</h1>` dan tagline di bawahnya.
- **Multi-user tanpa konflik**: karena akses tulis lewat Apps Script (bukan langsung ke Sheet), aman dipakai banyak orang sekaligus.
