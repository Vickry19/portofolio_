# Portofolio Astro + Supabase

Portofolio developer bergaya playful dengan panel admin di `/admin`. Isinya (profil, skill, pengalaman, proyek, sertifikat, foto, CV) diubah dari browser, tanpa membuka editor.

**Cara kerjanya:** konten disimpan di Supabase. Saat build, Astro membaca konten itu dan menghasilkan halaman statis (cepat dan ramah SEO). Setelah mengedit di admin, tekan **Simpan & terbitkan** agar situs dibangun ulang (sekitar 1-2 menit).

## 1. Siapkan Supabase (gratis)
1. Buat akun dan proyek baru di supabase.com.
2. Buka **SQL Editor**, tempel isi `supabase/setup.sql`, **ganti `GANTI_EMAIL_KAMU@contoh.com`** (3 tempat, huruf kecil) dengan emailmu, lalu Run.
3. Buka **Authentication > Users > Add user**, buat akun dengan email dan kata sandi itu.
4. Buka **Authentication > Sign In / Providers**, matikan pendaftaran pengguna baru (sign ups), agar orang lain tidak bisa membuat akun.
5. Buka **Project Settings > API**, salin **Project URL** dan **anon public key**.

## 2. Jalankan di komputer
```bash
cp .env.example .env     # isi PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev              # http://localhost:4321  dan  http://localhost:4321/admin
```
Tanpa `.env`, situs tetap jalan memakai data contoh (`src/data/default.json`).

## 3. Isi konten
Buka `/admin`, masuk, isi semuanya, unggah foto dan CV, lalu **Simpan**. Admin ada di URL terpisah dan tidak ditautkan di menu publik.

## 4. Deploy gratis ke Cloudflare Pages
1. Unggah proyek ke repo GitHub (`.env` tidak ikut karena ada di `.gitignore`).
2. Cloudflare Dashboard > **Workers & Pages > Create > Pages > Connect to Git**, pilih repo.
3. Framework preset: **Astro**. Build command `npm run build`, output `dist`.
4. Tambahkan **Environment variables**: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, dan `PUBLIC_SITE_URL` (alamat situsmu, mis. `https://namamu.pages.dev`).
5. Setelah deploy pertama: **Settings > Builds > Deploy hooks > Add**, salin URL-nya, lalu tempel di `/admin` bagian **Pengaturan**. Sejak itu tombol **Simpan & terbitkan** langsung memicu build.

## Keamanan
- Anon key memang publik. Yang melindungi data adalah aturan RLS di `setup.sql`: hanya email adminmu yang bisa menulis.
- Jangan membagikan kata sandi admin. Gunakan kata sandi panjang dan unik.
- URL deploy hook disimpan di browser admin saja, bukan di database.

## Catatan
- Proyek Supabase gratis dapat dijeda jika lama tidak aktif. Jika admin gagal memuat, aktifkan kembali dari dashboard. Situs publik tetap aman karena sudah berupa halaman statis hasil build.
- Gambar dikompres otomatis (maks. 1600 px, format WebP) saat diunggah.
- Pakai tombol **Unduh cadangan (JSON)** di admin secara berkala.
- Belum ada sitemap otomatis, form kontak berbackend, dan analitik. Cloudflare Web Analytics gratis bisa diaktifkan dari dashboard Cloudflare.
