import { createClient } from "@supabase/supabase-js";
import def from "../data/default.json";
import { slugify } from "../lib/slug.js";

const U = import.meta.env.PUBLIC_SUPABASE_URL, K = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const root = document.getElementById("adm");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const toast = (t) => { const e = document.getElementById("toast"); e.textContent = t; e.classList.add("on"); setTimeout(() => e.classList.remove("on"), 3200); };

if (!U || !K) { root.innerHTML = "<p>PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY belum diisi. Salin .env.example menjadi .env, isi nilainya, lalu jalankan ulang.</p>"; throw new Error("env"); }
const sb = createClient(U, K);

// skema form: [kunci, label, tipe?]  (t = textarea)
const S = {
  profile: [["name", "Nama"], ["role", "Peran / jabatan"], ["available", "Badge ketersediaan (kosongkan untuk menyembunyikan)"], ["bio", "Bio singkat (hero)", "t"], ["about", "Tentang saya", "t"], ["email", "Email"], ["github", "URL GitHub"], ["linkedin", "URL LinkedIn"], ["siteTitle", "Judul situs untuk Google (opsional)"], ["siteDesc", "Deskripsi situs untuk Google (opsional)", "t"]],
  skillGroups: [["name", "Nama kelompok"], ["items", "Skill (pisahkan koma)"]],
  experience: [["role", "Posisi"], ["org", "Organisasi"], ["period", "Periode"], ["desc", "Deskripsi", "t"]],
  projects: [["title", "Judul"], ["slug", "Slug URL (kosongkan agar otomatis)"], ["desc", "Deskripsi singkat (di kartu)"], ["detail", "Detail lengkap: masalah, peran, hasil", "t"], ["tags", "Tag (pisahkan koma)"], ["url", "Tautan demo"], ["repo", "Tautan GitHub"]],
  certs: [["title", "Judul"], ["issuer", "Penerbit / keterangan"]],
};
const NEW = {
  skillGroups: { name: "Kelompok baru", items: "" },
  experience: { role: "", org: "", period: "", desc: "" },
  projects: { title: "Proyek baru", slug: "", desc: "", detail: "", tags: "", url: "", repo: "", images: [] },
  certs: { title: "Sertifikat baru", issuer: "", img: "" },
};
const TITLES = { skillGroups: "Skill", experience: "Pengalaman", projects: "Proyek", certs: "Sertifikat & galeri" };

let C = structuredClone(def), dirty = false;

async function init() {
  const { data } = await sb.auth.getSession();
  data.session ? load() : login();
}
function login(msg = "") {
  root.innerHTML = `<form class="lg"><h2>Masuk admin</h2><label>Email<input id="em" type="email" autocomplete="username" required></label><label>Kata sandi<input id="pw" type="password" autocomplete="current-password" required></label><button class="btn" type="submit">Masuk</button><p id="er" role="alert">${esc(msg)}</p></form>`;
  root.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({
      email: root.querySelector("#em").value.trim(),
      password: root.querySelector("#pw").value,
    });
    if (error) { console.error(error); login("Gagal masuk: " + error.message); }
    else load();
  };
}
async function load() {
  const { data, error } = await sb.from("site").select("data").eq("id", "main").maybeSingle();
  if (error) { toast("Gagal memuat data: " + error.message); }
  const d = data?.data || {};
  C = { ...structuredClone(def), ...d, profile: { ...def.profile, ...d.profile } };
  dirty = false; draw();
}

const img = (u, sec, i, f, j) => `<figure><img src="${esc(u)}" alt="" loading="lazy"><button type="button" data-act="rmimg" data-s="${sec}" data-i="${i}" data-f="${f}" data-j="${j ?? ""}" aria-label="Hapus gambar">×</button></figure>`;
function fields(sec, obj, i) {
  return S[sec].map(([f, lb, t]) => {
    const a = `data-s="${sec}" data-i="${i ?? ""}" data-f="${f}"`;
    return `<label>${lb}${t ? `<textarea rows="3" ${a}>${esc(obj[f])}</textarea>` : `<input ${a} value="${esc(obj[f])}">`}</label>`;
  }).join("");
}
const up = (sec, i, f, accept, multi, text) => `<label class="btn alt sm">${text}<input type="file" hidden accept="${accept}" ${multi ? "multiple" : ""} data-up="${sec}:${i}:${f}"></label>`;

function draw() {
  const y = scrollY, p = C.profile;
  let h = `<h1 class="title in" style="font-size:40px">Panel admin</h1><p><small>Perubahan baru tampil di situs publik setelah menekan <b>Simpan &amp; terbitkan</b>.</small></p>`;
  h += `<h2>Profil</h2><div class="item">${fields("profile", p)}
    <div class="ims">${p.photo ? img(p.photo, "profile", "", "photo") : ""}</div>
    ${up("profile", "", "photo", "image/*", false, "Unggah foto profil")}${up("profile", "", "ogImage", "image/*", false, "Unggah gambar pratinjau link")}${up("profile", "", "cv", "application/pdf", false, "Unggah CV (PDF)")}
    <small style="display:block;margin-top:6px">${p.cv ? `CV terpasang. <a href="${esc(p.cv)}" target="_blank" rel="noopener">Lihat</a> <button class="btn sm" data-act="rmimg" data-s="profile" data-i="" data-f="cv" data-j="" type="button">Hapus CV</button>` : "CV belum diunggah."}</small>
    ${p.ogImage ? `<div class="ims">${img(p.ogImage, "profile", "", "ogImage")}</div>` : ""}</div>`;
  for (const sec of Object.keys(TITLES)) {
    h += `<h2>${TITLES[sec]}</h2>`;
    C[sec].forEach((o, i) => {
      h += `<div class="item"><b>${i + 1}.</b>${fields(sec, o, i)}`;
      if (sec === "projects") h += `<div class="ims">${(o.images || []).map((u, j) => img(u, sec, i, "images", j)).join("")}</div>${up(sec, i, "images", "image/*", true, "Tambah gambar")}`;
      if (sec === "certs") h += `<div class="ims">${o.img ? img(o.img, sec, i, "img") : ""}</div>${up(sec, i, "img", "image/*", false, "Unggah gambar")}`;
      h += `<div><button class="btn sm" type="button" data-act="up" data-s="${sec}" data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="Naikkan">↑</button><button class="btn sm" type="button" data-act="down" data-s="${sec}" data-i="${i}" ${i === C[sec].length - 1 ? "disabled" : ""} aria-label="Turunkan">↓</button><button class="btn sm" type="button" data-act="del" data-s="${sec}" data-i="${i}">Hapus</button></div></div>`;
    });
    h += `<button class="btn sm" type="button" data-act="add" data-s="${sec}">Tambah ${TITLES[sec].toLowerCase()}</button>`;
  }
  h += `<h2>Pengaturan &amp; cadangan</h2><div class="item"><label>URL deploy hook Cloudflare Pages (disimpan hanya di browser ini)<input id="hook" value="${esc(localStorage.getItem("hook") || "")}" placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."></label>
    <button class="btn sm" type="button" data-act="export">Unduh cadangan (JSON)</button>${up("", "", "", "application/json", false, "Pulihkan dari cadangan").replace('data-up="::"', 'data-import="1"')}</div>`;
  h += `<div class="sb"><span id="ds"><small>${dirty ? "Ada perubahan belum disimpan" : "Semua tersimpan"}</small></span><button class="btn sm" type="button" data-act="save">Simpan</button><button class="btn alt sm" type="button" data-act="pub">Simpan &amp; terbitkan</button><a class="btn sm" href="/" target="_blank" rel="noopener">Lihat situs</a><button class="btn sm" type="button" data-act="out">Keluar</button></div>`;
  root.innerHTML = h; scrollTo(0, y);
}
const mark = () => { dirty = true; const d = document.getElementById("ds"); if (d) d.innerHTML = "<small>Ada perubahan belum disimpan</small>"; };

async function shrink(file, max = 1600) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  const bm = await createImageBitmap(file), k = Math.min(1, max / Math.max(bm.width, bm.height));
  const c = document.createElement("canvas"); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
  c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob((b) => r(b || file), "image/webp", 0.82));
}
async function upload(file) {
  const blob = await shrink(file);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("media").upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}
async function save(pub) {
  const sl = C.projects.map((p) => p.slug || slugify(p.title));
  if (new Set(sl).size !== sl.length) return toast("Ada slug proyek yang kembar. Ubah salah satunya.");
  C.projects.forEach((p, i) => (p.slug = sl[i]));
  const { error } = await sb.from("site").upsert({ id: "main", data: C, updated_at: new Date().toISOString() });
  if (error) return toast("Gagal menyimpan: " + error.message);
  dirty = false; draw();
  if (!pub) return toast("Tersimpan. Belum diterbitkan ke situs publik.");
  const h = localStorage.getItem("hook");
  if (!h) return toast("Tersimpan. Isi URL deploy hook di Pengaturan agar bisa menerbitkan.");
  fetch(h, { method: "POST", mode: "no-cors" }); toast("Tersimpan dan penerbitan dimulai (sekitar 1-2 menit).");
}

root.addEventListener("input", (e) => {
  const d = e.target.dataset;
  if (e.target.id === "hook") { localStorage.setItem("hook", e.target.value.trim()); return; }
  if (!d.f) return;
  if (d.s === "profile") C.profile[d.f] = e.target.value; else C[d.s][d.i][d.f] = e.target.value;
  mark();
});
root.addEventListener("change", async (e) => {
  const t = e.target;
  if (t.dataset.import) {
    const f = t.files[0]; if (!f) return;
    try { const j = JSON.parse(await f.text()); if (!j.profile || !j.projects) throw 0; if (!confirm("Ganti semua isi dengan cadangan ini?")) return; C = { ...structuredClone(def), ...j }; mark(); draw(); }
    catch { toast("File cadangan tidak valid."); }
    return;
  }
  if (!t.dataset.up || !t.files.length) return;
  const [sec, i, f] = t.dataset.up.split(":");
  try {
    toast("Mengunggah…");
    const urls = []; for (const file of t.files) urls.push(await upload(file));
    if (sec === "profile") C.profile[f] = urls[0];
    else if (f === "images") C[sec][i].images = [...(C[sec][i].images || []), ...urls];
    else C[sec][i][f] = urls[0];
    mark(); draw(); toast("Terunggah. Jangan lupa simpan.");
  } catch (x) { toast("Gagal unggah: " + (x.message || "periksa izin Storage")); }
});
root.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const { act, s, i, f, j } = b.dataset, n = +i;
  if (act === "add") { C[s].push(structuredClone(NEW[s])); mark(); draw(); }
  else if (act === "del") { if (confirm("Hapus item ini?")) { C[s].splice(n, 1); mark(); draw(); } }
  else if (act === "up" || act === "down") { const m = act === "up" ? n - 1 : n + 1; [C[s][n], C[s][m]] = [C[s][m], C[s][n]]; mark(); draw(); }
  else if (act === "rmimg") {
    if (s === "profile") C.profile[f] = ""; else if (f === "images") C[s][n].images.splice(+j, 1); else C[s][n][f] = "";
    mark(); draw();
  }
  else if (act === "export") {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(C, null, 2)], { type: "application/json" }));
    a.download = `cadangan-portofolio-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
  }
  else if (act === "save") save(false);
  else if (act === "pub") save(true);
  else if (act === "out") { await sb.auth.signOut(); login(); }
});
addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
init();
