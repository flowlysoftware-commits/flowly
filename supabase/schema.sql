-- Flowly IA · Base inicial Supabase
-- Ejecutar en Supabase > SQL Editor > New query

create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  sector text not null default 'hair',
  phone text,
  city text,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  price numeric(10,2) not null default 0,
  duration_minutes integer not null default 30,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  starts_at timestamptz not null,
  status text not null default 'confirmed',
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'starter',
  status text not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.subscriptions enable row level security;

create policy "Owners can manage own businesses" on public.businesses
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owners can manage services" on public.services
for all using (
  exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid())
);

create policy "Owners can manage customers" on public.customers
for all using (
  exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_id = auth.uid())
);

create policy "Owners can manage bookings" on public.bookings
for all using (
  exists (select 1 from public.businesses b where b.id = bookings.business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = bookings.business_id and b.owner_id = auth.uid())
);

create policy "Owners can view subscriptions" on public.subscriptions
for select using (
  exists (select 1 from public.businesses b where b.id = subscriptions.business_id and b.owner_id = auth.uid())
);
