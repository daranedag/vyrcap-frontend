alter table public.site_settings enable row level security;
alter table public.site_blocks enable row level security;
alter table public.courses enable row level security;
alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.payment_providers enable row level security;
alter table public.payment_orders enable row level security;
alter table public.contact_messages enable row level security;
alter table public.integration_settings enable row level security;

create policy "public can read public site settings"
on public.site_settings for select
using (key = 'public_site');

create policy "public can read published site blocks"
on public.site_blocks for select
using (status = 'published');

create policy "public can read published courses"
on public.courses for select
using (status = 'published');

create policy "public can create contact messages"
on public.contact_messages for insert
with check (true);

create policy "authenticated users can read own profile"
on public.profiles for select
using (user_id = public.current_user_id());

create policy "authenticated users can update own profile"
on public.profiles for update
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

create policy "authenticated users can insert own profile"
on public.profiles for insert
with check (user_id = public.current_user_id());

create policy "authenticated users can read own enrollments"
on public.enrollments for select
using (user_id = public.current_user_id());

create policy "authenticated users can read own payment orders"
on public.payment_orders for select
using (user_id = public.current_user_id());

create policy "public can read active payment providers"
on public.payment_providers for select
using (status in ('active', 'sandbox'));

create policy "public can read public integration settings"
on public.integration_settings for select
using (id in ('moodle'));
