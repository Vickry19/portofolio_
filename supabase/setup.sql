-- Jalankan di Supabase: SQL Editor > New query > Run.
-- GANTI email di bawah dengan email akun admin kamu (huruf kecil semua).

create table if not exists public.site (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.site enable row level security;

create policy "publik boleh membaca" on public.site
  for select using (true);

create policy "hanya pemilik boleh menulis" on public.site
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'vickrykamaluddin2119@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'vickrykamaluddin2119@gmail.com');

-- Penyimpanan gambar & CV
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media dapat dilihat publik" on storage.objects
  for select using (bucket_id = 'media');

create policy "hanya pemilik mengelola media" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and (auth.jwt() ->> 'email') = 'vickrykamaluddin2119@gmail.com')
  with check (bucket_id = 'media' and (auth.jwt() ->> 'email') = 'vickrykamaluddin2119@gmail.com');
