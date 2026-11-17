import fallback from "../data/default.json";
export { slugify, safe } from "./slug.js";

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
let cache;

async function load() {
  if (!URL || !KEY) return fallback;
  try {
    const r = await fetch(`${URL}/rest/v1/site?id=eq.main&select=data`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const j = await r.json();
    const d = Array.isArray(j) && j[0]?.data;
    return d ? { ...fallback, ...d, profile: { ...fallback.profile, ...d.profile } } : fallback;
  } catch {
    console.warn("Supabase tidak terjangkau; memakai data contoh.");
    return fallback;
  }
}
export const getContent = () => (cache ??= load());
