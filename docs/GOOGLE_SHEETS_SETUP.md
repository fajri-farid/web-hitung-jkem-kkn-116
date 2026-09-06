# Panduan Setup Google Spreadsheet & Google Apps Script (Feedback JKEM)

Panduan ini membantu Anda menghubungkan form evaluasi feedback di website Hitung JKEM ke Google Spreadsheet secara **gratis 100%**, **real-time**, dan **aman (kredensial terlindungi)**.

---

## 🔒 Kenapa Metode Ini Aman & Terkendali?
1. **Tidak Ada Kredensial Rahasia di Frontend:** Web App URL Google Apps Script hanya berfungsi sebagai penerima data (*write-only webhook*). Anda tidak perlu menaruh password, secret key, atau token pribadi apa pun di website.
2. **Spreadsheet Tetap Privat:** File Google Spreadsheet Anda tetap berstatus privat di Google Drive Anda. Orang lain tidak bisa membaca isi sheet tersebut.
3. **Validasi Input:** Kode Apps Script di bawah hanya menerima dan mencatat jawaban form (Waktu Manual, Waktu Web, Rating), serta menolak data yang tidak sesuai.
4. **Anonim & Tanpa Data Pribadi:** Tidak mengambil nama, email, NIM, ataupun IP responden.

---

## Langkah 1: Buat Google Spreadsheet Baru

1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, misalnya: `Data Evaluasi Web JKEM KKN 116`.
3. Pada baris pertama (Row 1), buat judul kolom sebagai berikut:
   * **A1:** `Timestamp`
   * **B1:** `Waktu Manual`
   * **C1:** `Waktu Web`
   * **D1:** `Rating Pengalaman`

---

## Langkah 2: Pasang Kode Google Apps Script

1. Di menu Google Spreadsheet, klik **Ekstensi (Extensions)** &rarr; **Apps Script**.
2. Hapus semua kode bawaan yang ada di editor, lalu **salin dan tempelkan kode berikut**:

```javascript
/**
 * Script Penerima Feedback Evaluasi Web Hitung JKEM
 * Dibuat khusus untuk pengumpulan data evaluasi KKN yang aman & anonim.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Menghindari benturan data jika submit bersamaan

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // Sanitasi & Validasi Input Sederhana
    var manualTime = sanitizeInput(data.manualTime);
    var webTime = sanitizeInput(data.webTime);
    var rating = sanitizeInput(data.rating);
    var timestamp = new Date();

    // Pastikan data tidak kosong
    if (!manualTime || !webTime || !rating) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Data tidak lengkap"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Tambahkan baris baru ke Google Sheet
    sheet.appendRow([timestamp, manualTime, webTime, rating]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Feedback berhasil disimpan"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Fungsi bantu untuk membersihkan teks input
function sanitizeInput(str) {
  if (!str) return "";
  return String(str).trim().substring(0, 100);
}
```

3. Klik ikon **Simpan (Save)** (ikon disket atau `Ctrl + S`).

---

## Langkah 3: Deploy sebagai Web App

1. Di pojok kanan atas editor Apps Script, klik tombol **Terapkan (Deploy)** &rarr; **Penerapan Baru (New deployment)**.
2. Klik ikon gerigi ⚙️ di sebelah kiri *Pilih jenis (Select type)*, lalu pilih **Aplikasi Web (Web app)**.
3. Atur konfigurasi berikut:
   * **Deskripsi:** `Feedback JKEM Web App`
   * **Jalankan sebagai (Execute as):** `Saya (email Anda)`
   * **Yang memiliki akses (Who has access):** **`Siapa saja (Anyone)`** *(PENTING: Ini agar mahasiswa yang mengisi feedback tidak diwajibkan login akun Google)*.
4. Klik tombol **Terapkan (Deploy)**.
5. Jika muncul permintaan izin (*Authorization Required*):
   * Klik **Tinjau Izin (Review permissions)**.
   * Pilih akun Google Anda.
   * Jika muncul peringatan *"Google hasn't verified this app"*, klik **Lanjutan (Advanced)** di bawah, lalu klik **Buka (tidak aman) / Go to ... (unsafe)**.
   * Klik **Izinkan (Allow)**.
6. Salin **URL Aplikasi Web (Web app URL)** yang diberikan.
   * Formatnya seperti: `https://script.google.com/macros/s/AKfycbx.../exec`

---

## Langkah 4: Sambungkan ke File `.env` di Website

1. Buka file [`.env`](./.env) di project website Anda.
2. Masukkan URL Web App yang sudah Anda salin tadi dengan variabel `VITE_GOOGLE_SCRIPT_FEEDBACK_URL`:
   ```env
   VITE_GOOGLE_SCRIPT_FEEDBACK_URL=https://script.google.com/macros/s/AKfycbx.../exec
   ```
3. File [`script.js`](./script.js) sudah otomatis membaca variabel ini via `import.meta.env.VITE_GOOGLE_SCRIPT_FEEDBACK_URL`.
4. File `.env` Anda juga sudah otomatis dilindungi oleh `.gitignore` sehingga tidak akan ter-upload ke repositori publik GitHub saat Anda melakukan `git push`.
5. *(Opsional - Jika dideploy ke Vercel)*:
   * Buka dashboard Vercel proyek Anda &rarr; **Settings** &rarr; **Environment Variables**.
   * Tambahkan Key: `VITE_GOOGLE_SCRIPT_FEEDBACK_URL` dan Value: *(URL Web App Google Apps Script Anda)*.
6. Selesai! Kini setiap kali user mengisi 3 pertanyaan tersebut, datanya langsung terkirim dan muncul di baris baru Google Spreadsheet Anda secara *real-time*.

---

## 📊 Tips Tambahan: Rumus Analisis di Google Sheet untuk Laporan KKN

Setelah data mulai masuk, Anda bisa membuat tabel rekapitulasi di Sheet baru untuk bahan laporan:
* **Total Responden:** `=COUNTA(A2:A)`
* **Persentase Pengalaman Baik/Sangat Baik:**
  `=COUNTIF(D2:D, "Sangat baik") + COUNTIF(D2:D, "Baik")` dibagi total responden.
* **Grafik:** Blok kolom B, C, atau D lalu klik **Sisipkan (Insert)** &rarr; **Diagram (Chart)** untuk membuat Pie Chart atau Bar Chart langsung siap dimasukkan ke PowerPoint / Laporan KKN!
