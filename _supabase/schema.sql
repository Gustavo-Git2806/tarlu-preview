-- =============================================================================
-- Tarlu — Supabase schema for form submissions.
-- Paste this into: Supabase dashboard → SQL editor → New query → Run.
-- Assumes anon key has INSERT-only via RLS. Admin reads via authenticated role.
-- =============================================================================

-- --- Tables ------------------------------------------------------------------

create table if not exists public.enquiries (
    id            uuid primary key default gen_random_uuid(),
    created_at    timestamptz not null default now(),
    company       text not null,
    country       text,
    full_name     text not null,
    email         text not null,
    phone         text,
    sector        text,
    services      text[],
    region        text[],
    product_type  text,
    skus          text,
    hazardous     text,
    barcoded      text,
    tracking      text[],
    weight_brackets text[],
    length_brackets text[],
    storage_initial text,
    storage_peak    text,
    orders_per_week text,
    units_per_order text,
    add_services    text[],
    go_live_date    date,
    notes           text,
    hear_source     text,
    status        text not null default 'new'
);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx     on public.enquiries (status);

create table if not exists public.complaints (
    id            uuid primary key default gen_random_uuid(),
    created_at    timestamptz not null default now(),
    full_name     text not null,
    company       text not null,
    email         text not null,
    phone         text,
    is_client     boolean,
    category      text not null,
    description   text not null,
    resolution    text not null,
    status        text not null default 'new'
);
create index if not exists complaints_created_at_idx on public.complaints (created_at desc);

create table if not exists public.agency_requests (
    id             uuid primary key default gen_random_uuid(),
    created_at     timestamptz not null default now(),
    requested_by   text not null,
    warehouse      text not null,
    client_code    text not null,
    reason         text not null,
    charge_method  text not null,
    applied_by     text not null,
    revenue        numeric,
    charge_date    date,
    hours          numeric,
    timeline       text,
    margin         text,
    status         text not null default 'pending'
);

create table if not exists public.mailing_list (
    id            uuid primary key default gen_random_uuid(),
    created_at    timestamptz not null default now(),
    full_name     text not null,
    company       text,
    email         text not null unique,
    topics        text[],
    unsubscribed_at timestamptz
);

create table if not exists public.contact_messages (
    id            uuid primary key default gen_random_uuid(),
    created_at    timestamptz not null default now(),
    first_name    text,
    company       text not null,
    email         text not null,
    phone         text,
    message       text,
    status        text not null default 'new'
);

-- --- Row-Level Security ------------------------------------------------------
-- Public forms may INSERT (from the anon key) but never SELECT/UPDATE/DELETE.
-- Authenticated users (admin) may read + update all rows.

alter table public.enquiries        enable row level security;
alter table public.complaints       enable row level security;
alter table public.agency_requests  enable row level security;
alter table public.mailing_list     enable row level security;
alter table public.contact_messages enable row level security;

-- INSERT policies — anon can submit forms.
create policy "anon can submit enquiries"        on public.enquiries        for insert to anon with check (true);
create policy "anon can submit complaints"       on public.complaints       for insert to anon with check (true);
create policy "anon can submit agency_requests"  on public.agency_requests  for insert to anon with check (true);
create policy "anon can subscribe mailing_list"  on public.mailing_list     for insert to anon with check (true);
create policy "anon can submit contact_messages" on public.contact_messages for insert to anon with check (true);

-- SELECT / UPDATE / DELETE — authenticated admin only.
create policy "authed read enquiries"        on public.enquiries        for select to authenticated using (true);
create policy "authed read complaints"       on public.complaints       for select to authenticated using (true);
create policy "authed read agency_requests"  on public.agency_requests  for select to authenticated using (true);
create policy "authed read mailing_list"     on public.mailing_list     for select to authenticated using (true);
create policy "authed read contact_messages" on public.contact_messages for select to authenticated using (true);

create policy "authed update enquiries"        on public.enquiries        for update to authenticated using (true) with check (true);
create policy "authed update complaints"       on public.complaints       for update to authenticated using (true) with check (true);
create policy "authed update agency_requests"  on public.agency_requests  for update to authenticated using (true) with check (true);
create policy "authed update contact_messages" on public.contact_messages for update to authenticated using (true) with check (true);
