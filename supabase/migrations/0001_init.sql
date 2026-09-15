-- Field Visit Tracker — initial schema
-- Single-user personal tool: RLS scopes every row to auth.uid(), no admin role.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: extends auth.users
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: owner full access"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create a profile row when a new auth user signs up.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- field_visits / field_visit_sections / field_visit_items
-- Authored directly via SQL/seed scripts, not through an in-app builder.
-- Read-only to the app; writes happen via the Supabase SQL editor or
-- service-role scripts.
-- ---------------------------------------------------------------------------
create type visit_status as enum ('draft', 'published', 'archived');

create table field_visits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  objectives text,
  location_name text,
  visit_date date,
  status visit_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table field_visit_sections (
  id uuid primary key default gen_random_uuid(),
  field_visit_id uuid not null references field_visits (id) on delete cascade,
  title text not null,
  instructions text,
  order_index int not null,
  unique (field_visit_id, order_index)
);

create type item_type as enum (
  'measurement',
  'observation',
  'checklist',
  'photo',
  'gps',
  'species_list'
);

create type repeat_scope as enum ('visit', 'site');

create table field_visit_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references field_visit_sections (id) on delete cascade,
  item_type item_type not null,
  repeat_scope repeat_scope not null default 'visit',
  label text not null,
  help_text text,
  order_index int not null,
  is_required boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  unique (section_id, order_index)
);

alter table field_visits enable row level security;
alter table field_visit_sections enable row level security;
alter table field_visit_items enable row level security;

-- Read-only for any authenticated user; writes are done via SQL editor /
-- service role, not through these policies.
create policy "field_visits: read published"
  on field_visits for select
  to authenticated
  using (status = 'published');

create policy "field_visit_sections: read via parent visit"
  on field_visit_sections for select
  to authenticated
  using (
    exists (
      select 1 from field_visits v
      where v.id = field_visit_sections.field_visit_id
        and v.status = 'published'
    )
  );

create policy "field_visit_items: read via parent section"
  on field_visit_items for select
  to authenticated
  using (
    exists (
      select 1 from field_visit_sections s
      join field_visits v on v.id = s.field_visit_id
      where s.id = field_visit_items.section_id
        and v.status = 'published'
    )
  );

-- ---------------------------------------------------------------------------
-- field_visit_submissions: one attempt per (visit, student)
-- No immutability lock — this is a personal tracker, not a graded LMS, so
-- the owner can keep editing after "submitting".
-- ---------------------------------------------------------------------------
create type submission_status as enum ('in_progress', 'complete');

create table field_visit_submissions (
  id uuid primary key default gen_random_uuid(),
  field_visit_id uuid not null references field_visits (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  status submission_status not null default 'in_progress',
  client_submission_id uuid not null unique,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (field_visit_id, student_id)
);

alter table field_visit_submissions enable row level security;

create policy "submissions: owner full access"
  on field_visit_submissions for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ---------------------------------------------------------------------------
-- submission_sites: dynamic sampling sites, created by the student at
-- runtime (e.g. "Upstream", "Middle", "Downstream") — not predefined by
-- the field visit config.
-- ---------------------------------------------------------------------------
create table submission_sites (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references field_visit_submissions (id) on delete cascade,
  label text not null,
  order_index int not null,
  gps_lat double precision,
  gps_lng double precision,
  created_at timestamptz not null default now(),
  unique (submission_id, order_index)
);

alter table submission_sites enable row level security;

create policy "submission_sites: owner full access via parent submission"
  on submission_sites for all
  using (
    exists (
      select 1 from field_visit_submissions sub
      where sub.id = submission_sites.submission_id
        and sub.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from field_visit_submissions sub
      where sub.id = submission_sites.submission_id
        and sub.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- submission_answers: one row per (submission, item, site).
-- site_id is null for visit-scoped items, set for site-scoped items.
-- GPS gets dedicated columns since it's validated/queried distinctly;
-- everything else (measurement numbers, observation text, checklist
-- booleans, species_list rows) lives in `value` jsonb.
-- ---------------------------------------------------------------------------
create table submission_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references field_visit_submissions (id) on delete cascade,
  item_id uuid not null references field_visit_items (id) on delete cascade,
  site_id uuid references submission_sites (id) on delete cascade,
  value jsonb not null default '{}'::jsonb,
  gps_lat double precision,
  gps_lng double precision,
  gps_accuracy_m double precision,
  gps_captured_at timestamptz,
  client_updated_at timestamptz not null default now(),
  synced_at timestamptz,
  unique (submission_id, item_id, site_id)
);

create index submission_answers_submission_idx on submission_answers (submission_id);

alter table submission_answers enable row level security;

create policy "submission_answers: owner full access via parent submission"
  on submission_answers for all
  using (
    exists (
      select 1 from field_visit_submissions sub
      where sub.id = submission_answers.submission_id
        and sub.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from field_visit_submissions sub
      where sub.id = submission_answers.submission_id
        and sub.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- submission_photos
-- ---------------------------------------------------------------------------
create table submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references field_visit_submissions (id) on delete cascade,
  item_id uuid references field_visit_items (id) on delete cascade,
  site_id uuid references submission_sites (id) on delete cascade,
  storage_path text not null,
  caption text,
  taken_at timestamptz,
  gps_lat double precision,
  gps_lng double precision,
  client_local_id uuid not null unique,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index submission_photos_submission_idx on submission_photos (submission_id);

alter table submission_photos enable row level security;

create policy "submission_photos: owner full access via parent submission"
  on submission_photos for all
  using (
    exists (
      select 1 from field_visit_submissions sub
      where sub.id = submission_photos.submission_id
        and sub.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from field_visit_submissions sub
      where sub.id = submission_photos.submission_id
        and sub.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- updated_at bookkeeping
-- ---------------------------------------------------------------------------
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger field_visits_set_updated_at
  before update on field_visits
  for each row execute procedure set_updated_at();

create trigger field_visit_submissions_set_updated_at
  before update on field_visit_submissions
  for each row execute procedure set_updated_at();
