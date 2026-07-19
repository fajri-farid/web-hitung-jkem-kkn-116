# Hitung JKEM — SIPBPM UNHAS

Kalkulator berbasis browser untuk menghitung akumulasi JKEM dari data logbook KKN Universitas Hasanuddin.

Aplikasi ini membantu pengguna mengambil respons data logbook dari SIPBPM UNHAS, menempelkan data JSON, lalu melihat ringkasan dan rincian nilai JKEM secara otomatis.

## Fitur

- Panduan penggunaan yang menekankan login SIPBPM terlebih dahulu.
- Tombol untuk membuka halaman respons data logbook.
- Instruksi shortcut untuk Windows dan MacBook.
- Perhitungan total logbook, jumlah logbook yang memiliki JKEM, dan akumulasi JKEM.
- Ringkasan JKEM yang sudah disetujui, belum disetujui, target 180 jam, dan sisa capaian.
- Badge status persetujuan pada setiap baris logbook.
- Tabel rincian logbook.
- Pemrosesan data langsung di browser pengguna.
- Responsive layout untuk desktop, tablet, dan mobile.
- Tidak membutuhkan backend, database, package manager, atau proses build.

## Cara menggunakan

1. Buka aplikasi.
2. Login ke SIPBPM UNHAS pada browser yang sama.
3. Klik **Sudah login? Buka halaman data logbook**.
4. Pada tab data yang terbuka, salin seluruh respons JSON.
5. Kembali ke aplikasi dan tempelkan JSON ke kotak input.
6. Klik **Hitung total JKEM**.

Jika halaman data mengarah ke halaman login, selesaikan login terlebih dahulu. Sesi login harus aktif pada browser yang sama agar data logbook dapat diakses.

## Cara membaca hasil

Ringkasan awal tetap menampilkan total logbook dan total seluruh JKEM yang terdeteksi. Di bawahnya terdapat ringkasan persetujuan:

- **Sudah disetujui** adalah JKEM dari logbook dengan status persetujuan yang dikenali sebagai disetujui.
- **Belum disetujui** adalah JKEM yang masih menunggu persetujuan atau memiliki status yang belum dikenali.
- **Sisa menuju target** dihitung dari target 180 jam dikurangi JKEM yang sudah disetujui.
- Status **Perlu diperbaiki** ditampilkan pada baris logbook jika respons memuat status ditolak atau revisi.

Jika format status dari SIPBPM berubah dan belum dikenali, aplikasi memilih kategori **Belum disetujui** sebagai pilihan yang lebih aman. JKEM tidak akan dianggap sudah disetujui tanpa status yang jelas.

Respons SIPBPM saat ini mengirim status sebagai HTML badge, contohnya `badge-success` dengan teks `dierima` dan `badge-info` dengan teks `Klaim JKEM`. Aplikasi membersihkan HTML tersebut sebelum membaca status dan mengenali `dierima` sebagai status diterima. Label `Klaim JKEM` saja tidak dianggap sebagai persetujuan karena klaim belum tentu sudah disetujui.

## Struktur proyek

```text
Hitung-JKEM/
├── index.html    # Struktur halaman dan konten
├── style.css     # Design system, layout, dan responsive styles
├── script.js     # Tab, pengambilan data, parsing JSON, dan kalkulasi JKEM
└── README.md     # Dokumentasi proyek
```

## Menjalankan secara lokal

Karena aplikasi ini berupa static site, file dapat dibuka langsung dengan browser. Untuk pengalaman yang lebih menyerupai deployment, jalankan static server sederhana dari root project.

Contoh dengan Python:

```bash
python -m http.server 8000
```

Kemudian buka:

```text
http://localhost:8000
```

## Deployment ke Vercel

Project ini siap dideploy langsung ke Vercel tanpa konfigurasi tambahan.

### Melalui dashboard Vercel

1. Push project ke repository Git.
2. Import repository tersebut di Vercel.
3. Biarkan **Framework Preset** menggunakan `Other` atau static site.
4. Kosongkan **Build Command**.
5. Kosongkan **Output Directory**.
6. Klik **Deploy**.

### Melalui Vercel CLI

```bash
npm install -g vercel
vercel
```

Saat diminta, gunakan root project ini sebagai lokasi deployment. Tidak ada folder `dist` atau `build` yang perlu diatur.

## Catatan privasi

Data JSON hanya diproses di browser melalui JavaScript. Project ini tidak mengirim data logbook ke server aplikasi lain.

## Developer

**Fajri Farid**

- Web: [fajrifarid.com](https://fajrifarid.com)
- LinkedIn: [linkedin.com/in/muhfajrifarid](https://www.linkedin.com/in/muhfajrifarid/)
- Instagram: [@fajri_farid](https://www.instagram.com/fajri_farid/)
