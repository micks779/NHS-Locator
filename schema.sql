-- ELFT Locator — run this in the SQL Editor on a NEW Supabase project
-- before: npm run data:import (with SUPABASE_SERVICE_ROLE_KEY)

create extension if not exists "pgcrypto";

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  postcode text,
  latitude double precision,
  longitude double precision,
  reception_phone text,
  borough text,
  has_step_free_access boolean default true,
  has_parking boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  directorate text,
  service_lead text,
  senior_manager text,
  url text,
  description text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.site_services (
  site_id uuid not null references public.sites (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (site_id, service_id)
);

create table if not exists public.external_partner_sites (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  service_name text not null unique,
  address text,
  postcode text,
  borough text,
  latitude double precision,
  longitude double precision,
  category text,
  service_url text,
  match_status text default 'External / Partner Site',
  source_original_site_name text,
  source_estates_building text,
  flag text,
  created_at timestamptz default now()
);

create index if not exists idx_site_services_site on public.site_services (site_id);
create index if not exists idx_site_services_service on public.site_services (service_id);
create index if not exists idx_external_partner_sites_site on public.external_partner_sites (site_name);

alter table public.sites enable row level security;
alter table public.services enable row level security;
alter table public.site_services enable row level security;
alter table public.external_partner_sites enable row level security;

-- Public read for the anon key used by the Vite app
create policy "sites_select_anon" on public.sites for select to anon using (true);
create policy "services_select_anon" on public.services for select to anon using (true);
create policy "site_services_select_anon" on public.site_services for select to anon using (true);
create policy "external_partner_sites_select_anon" on public.external_partner_sites for select to anon using (true);

create policy "sites_select_authenticated" on public.sites for select to authenticated using (true);
create policy "services_select_authenticated" on public.services for select to authenticated using (true);
create policy "site_services_select_authenticated" on public.site_services for select to authenticated using (true);
create policy "external_partner_sites_select_authenticated" on public.external_partner_sites for select to authenticated using (true);
