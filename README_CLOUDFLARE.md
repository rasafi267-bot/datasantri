# DATA SANTRI ANNUR V4 — CLOUDFLARE

Versi ini memakai Cloudflare Worker + D1, bukan Express/Render.

## Yang sudah tersedia
- Login santri
- Login admin
- Dashboard admin
- Data santri
- Pelanggaran
- SPP
- Dekosan
- Event
- Contact Person
- Ganti sandi admin
- D1 database
- Static assets dari folder public

Password admin awal: `kantorbebe`

## 1. Buat D1
Di Cloudflare Dashboard:
Workers & Pages > D1 SQL databases > Create database.
Nama:
`data-santri-annur`

Setelah database dibuat, salin Database ID.

## 2. Edit wrangler.jsonc
Ganti:
`GANTI_DENGAN_DATABASE_ID`
dengan Database ID milikmu.

## 3. Jalankan migration
Di komputer yang sudah memiliki Node.js:
`npm install`
`npx wrangler login`
`npx wrangler d1 migrations apply data-santri-annur --remote`

Migration membuat tabel:
admins, santri, pelanggaran, spp, dekosan, events, contacts.

## 4. Deploy
`npx wrangler deploy`

Setelah selesai, Wrangler akan memberikan alamat `workers.dev`.

## 5. GitHub
Upload semua file project ke repository GitHub. Jangan upload token/password rahasia.

Untuk deployment otomatis dari GitHub, gunakan integrasi GitHub/Workers di Cloudflare atau workflow CI. `wrangler.jsonc` adalah konfigurasi utama.

## 6. Excel
V4 ini sengaja memisahkan import Excel dari runtime web agar database D1 tetap aman. Data Excel dapat diubah menjadi SQL/CSV dan diimpor ke D1. Untuk versi berikutnya dapat dibuat tombol upload Excel langsung yang membaca file di Worker.

## Catatan keamanan
Password contoh `kantorbebe` harus segera diganti setelah login admin.

Sistem ini adalah template teknis. Untuk data santri sungguhan, tambahkan hashing password, audit log, role admin, validasi file, dan object storage untuk foto sebelum penggunaan produksi.
