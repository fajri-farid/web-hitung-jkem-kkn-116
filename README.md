<div align="center">

# Hitung JKEM

Kalkulator JKEM KKN UNHAS dari data logbook SIPBPM.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://web-hitung-jkem-kkn-116.vercel.app/)
[![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
</div>

[Buka aplikasi](https://web-hitung-jkem-kkn-116.vercel.app/) · Kalkulator browser untuk membantu peserta KKN Universitas Hasanuddin menghitung akumulasi JKEM dari data logbook SIPBPM.

Tempel respons JSON logbook, lalu aplikasi menampilkan total JKEM, status persetujuan, progres target 180 jam, dan rincian setiap logbook.

## Fitur

- Menghitung total logbook dan akumulasi JKEM.
- Memisahkan JKEM yang sudah disetujui dan masih menunggu persetujuan.
- Menampilkan progres menuju target 180 jam.
- Menyajikan rincian logbook dalam tabel.
- Memproses data langsung di browser; tidak ada database atau backend aplikasi.

## Cara menggunakan

1. Login ke SIPBPM UNHAS pada browser yang sama.
2. Di aplikasi, klik **Sudah login? Buka halaman data logbook**.
3. Salin seluruh respons JSON yang terbuka.
4. Tempelkan JSON ke aplikasi dan pilih **Hitung total JKEM**.

Jika halaman data kembali ke login, selesaikan login di tab tersebut terlebih dahulu, lalu ulangi langkah 2.

## Menjalankan secara lokal

Project menggunakan Vite untuk menjalankan development server dan membuat build produksi.

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite. Untuk mengecek build produksi:

```bash
npm run build
```

## Deploy ke Vercel

Import repository ini ke Vercel. Vercel seharusnya mendeteksi **Vite** secara otomatis; jika tidak, gunakan pengaturan berikut:

- Build Command: `npm run build`
- Output Directory: `dist`

## Privasi

Data logbook diproses di perangkat pengguna dan tidak dikirim oleh aplikasi ini ke server aplikasi lain. Jangan membagikan respons JSON logbook kepada pihak yang tidak dipercaya.

## Teknologi

- HTML, CSS, dan JavaScript
- [Vite](https://vite.dev/)

## Pengembang

Dikembangkan oleh [Fajri Farid](https://fajrifarid.com) · [LinkedIn](https://www.linkedin.com/in/muhfajrifarid/) · [Instagram](https://www.instagram.com/fajri_farid/)
