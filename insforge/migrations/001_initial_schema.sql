create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.current_user_id()
returns text as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '');
$$ language sql stable;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_blocks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section text not null,
  title text not null,
  eyebrow text,
  body text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  description text not null,
  objective text not null,
  contents text[] not null default '{}',
  audience text not null,
  modality text not null,
  price_clp integer not null default 0 check (price_clp >= 0),
  duration_hours integer not null default 0 check (duration_hours >= 0),
  thumbnail_url text,
  moodle_course_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id text primary key,
  full_name text,
  rut text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin', 'instructor')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled', 'completed')),
  moodle_user_id text,
  moodle_enrollment_id text,
  enrolled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.payment_providers (
  id text primary key,
  name text not null,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'sandbox')),
  public_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.payment_providers(id),
  provider_order_id text,
  provider_payment_id text,
  user_id text,
  course_id uuid not null references public.courses(id),
  amount_clp integer not null check (amount_clp >= 0),
  status text not null default 'created' check (status in ('created', 'pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  checkout_url text,
  raw_request jsonb not null default '{}'::jsonb,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  source text not null default 'public_site',
  status text not null default 'new' check (status in ('new', 'read', 'resolved', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_settings (
  id text primary key,
  name text not null,
  provider text not null,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'sandbox')),
  public_config jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_status_order_idx on public.courses (status, display_order);
create index if not exists payment_orders_user_idx on public.payment_orders (user_id);
create index if not exists payment_orders_course_idx on public.payment_orders (course_id);
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger set_site_blocks_updated_at
before update on public.site_blocks
for each row execute function public.set_updated_at();

create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_enrollments_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

create trigger set_payment_providers_updated_at
before update on public.payment_providers
for each row execute function public.set_updated_at();

create trigger set_payment_orders_updated_at
before update on public.payment_orders
for each row execute function public.set_updated_at();

create trigger set_contact_messages_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

create trigger set_integration_settings_updated_at
before update on public.integration_settings
for each row execute function public.set_updated_at();
