const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
const fine = matchMedia("(pointer:fine)").matches;
let moved = 0;

// tema terang/gelap
$("#tg")?.addEventListener("click", () => {
  const d = document.documentElement;
  const cur = d.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
  const n = cur === "dark" ? "light" : "dark";
  d.dataset.theme = n;
  try { localStorage.setItem("theme", n); } catch {}
});

// menu HP
$("#mb")?.addEventListener("click", () => $("nav").classList.toggle("open"));
$("nav")?.addEventListener("click", (e) => { if (e.target.closest(".nl a")) $("nav").classList.remove("open"); });

// progres scroll
addEventListener("scroll", () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  $("#bar").style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
}, { passive: true });

// reveal saat scroll
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.15 });
$$(".rv").forEach((e, i) => { e.style.transitionDelay = (i % 3) * 0.08 + "s"; rm ? e.classList.add("in") : io.observe(e); });

// teks mengetik
const ty = $("#ty");
if (ty && !rm) {
  const t = ty.dataset.t || ty.textContent; let i = t.length, d = -1;
  setInterval(() => { i += d; ty.textContent = t.slice(0, i); if (i >= t.length + 12) d = -1; if (i <= 0) d = 1; }, 110);
}

// partikel di hero
const c = $("#cv");
if (c && !rm) {
  const x = c.getContext("2d"), m = { x: -999, y: -999 }, cols = ["#ff5d8f", "#ffc93c", "#3ad7c4", "#6c5ce7"];
  let W, H, P = [];
  const rs = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight;
    P = Array.from({ length: Math.min(70, (W / 14) | 0) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.8 + 0.4, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, c: cols[(Math.random() * 4) | 0] })); };
  rs(); addEventListener("resize", rs);
  c.parentElement.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
  (function f() {
    if (scrollY > H) return requestAnimationFrame(f);
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
      if (d < 140 && d > 0) { p.x += (dx / d) * 3 * p.z; p.y += (dy / d) * 3 * p.z; }
      p.x += p.vx * p.z; p.y += p.vy * p.z;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      x.globalAlpha = 0.8; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, 6 * p.z, 0, 7); x.fill();
    }
    x.globalAlpha = 0.25; x.strokeStyle = "#6c5ce7";
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      if (Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y) < 100) { x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); x.stroke(); }
    }
    requestAnimationFrame(f);
  })();
}

// kursor, magnetic, tilt 3D
if (fine && !rm) {
  const cur = $("#cur"); cur.classList.add("on");
  let cx = 0, cy = 0, tx = 0, ty2 = 0;
  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty2 = e.clientY;
    cur.classList.toggle("big", !!e.target.closest?.("a,button,.chip,.zoom"));
    $$(".mag").forEach((b) => { const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); b.style.transform = Math.hypot(dx, dy) < 90 ? `translate(${dx * 0.3}px,${dy * 0.4}px)` : ""; });
    const k = e.target.closest?.(".tilt");
    $$(".tilt").forEach((t) => { if (t !== k) t.style.transform = ""; });
    if (k) { const r = k.getBoundingClientRect(); k.style.transform = `rotateY(${((e.clientX - r.left) / r.width - 0.5) * 16}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * 16}deg) translateZ(10px)`; }
  });
  (function l() { cx += (tx - cx) * 0.2; cy += (ty2 - cy) * 0.2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(l); })();
}

// karosel sertifikat (berputar)
const tr = $("#tr");
if (tr) {
  const go = (d) => {
    const m = tr.scrollWidth - tr.clientWidth, step = tr.firstElementChild.offsetWidth + 22;
    if (d > 0 && tr.scrollLeft >= m - 4) tr.scrollTo({ left: 0, behavior: "smooth" });
    else if (d < 0 && tr.scrollLeft <= 4) tr.scrollTo({ left: m, behavior: "smooth" });
    else tr.scrollBy({ left: d * step, behavior: "smooth" });
  };
  $(".car .l").onclick = () => go(-1); $(".car .r").onclick = () => go(1);
  let dn = 0, sx = 0, sl = 0;
  tr.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") { dn = 1; moved = 0; sx = e.clientX; sl = tr.scrollLeft; tr.style.scrollSnapType = "none"; } });
  addEventListener("pointerup", () => { if (dn) { dn = 0; tr.style.scrollSnapType = ""; } });
  tr.addEventListener("pointermove", (e) => { if (dn) { tr.scrollLeft = sl - (e.clientX - sx); if (Math.abs(e.clientX - sx) > 6) moved = 1; } });
}

// lightbox (sertifikat & galeri proyek)
const lb = $("#lb");
let grp = [], gi = 0;
const el = (t, cls, txt) => { const n = document.createElement(t); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; };
function show() {
  const d = grp[gi].dataset, box = el("div", "box");
  if (d.src) { const im = new Image(); im.src = d.src; im.alt = d.title || ""; box.append(im); } else box.append(el("div", "big", "🏆"));
  if (d.title) { const cap = el("div", "cap"); cap.append(el("h3", "", d.title), el("p", "", d.sub || "")); box.append(cap); }
  const x = el("button", "btn sm x", "Tutup ✕"); x.dataset.x = "";
  lb.replaceChildren(x, box);
  if (grp.length > 1) for (const [n, t] of [[-1, "‹"], [1, "›"]]) { const b = el("button", "arr " + (n < 0 ? "l" : "r"), t); b.dataset.n = n; b.setAttribute("aria-label", n < 0 ? "Sebelumnya" : "Berikutnya"); lb.append(b); }
  lb.classList.add("on");
}
document.addEventListener("click", (e) => {
  if (moved) { moved = 0; return; }
  if (lb.classList.contains("on")) {
    const n = e.target.closest("[data-n]");
    if (n) { gi = (gi + +n.dataset.n + grp.length) % grp.length; show(); }
    else if (e.target === lb || e.target.closest("[data-x]")) lb.classList.remove("on");
    return;
  }
  const t = e.target.closest("[data-lb]");
  if (t) { grp = $$(`[data-lb="${t.dataset.lb}"]`); gi = grp.indexOf(t); show(); }
});
addEventListener("keydown", (e) => {
  if (!lb.classList.contains("on")) return;
  if (e.key === "Escape") lb.classList.remove("on");
  if (e.key === "ArrowRight" && grp.length > 1) { gi = (gi + 1) % grp.length; show(); }
  if (e.key === "ArrowLeft" && grp.length > 1) { gi = (gi - 1 + grp.length) % grp.length; show(); }
});

// transisi kurtain hanya untuk lompatan jauh di halaman yang sama
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"], a[href^="/#"]');
  if (!a) return;
  const id = a.getAttribute("href").split("#")[1];
  const t = id && document.getElementById(id);
  if (!t || (a.pathname !== location.pathname)) return;
  e.preventDefault();
  if (rm || Math.abs(t.getBoundingClientRect().top) < innerHeight * 1.5) { t.scrollIntoView({ behavior: rm ? "auto" : "smooth" }); return; }
  const w = $("#wipe"); w.classList.remove("go"); void w.offsetWidth; w.classList.add("go");
  setTimeout(() => t.scrollIntoView({ behavior: "auto" }), 420);
  setTimeout(() => w.classList.remove("go"), 1200);
});
