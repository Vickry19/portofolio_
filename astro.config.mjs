import { defineConfig } from "astro/config";

// Isi PUBLIC_SITE_URL (mis. https://namamu.pages.dev) di environment variable
// agar canonical dan gambar pratinjau memakai alamat yang benar.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://contoh.pages.dev",
});
