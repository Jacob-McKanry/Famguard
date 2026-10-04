-- Family Guardian: database setup.
-- How to use: open your Supabase project, go to "SQL Editor", paste this whole
-- file, and press Run. Safe to run once on an empty project.

create table signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  email text not null,
  plan text not null check (plan in ('basic','plus','premium')),
  typed_monthly_amount numeric(8,2),
  not_sure boolean not null default false,
  who_for text not null,
  state text not null,
  worry text,
  consent boolean not null,
  src text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  deposit_status text not null default 'none' check (deposit_status in ('none','pending','paid','refunded')),
  stripe_session_id text,
  price_set text check (price_set in ('A','B')),
  price_confirmed_at timestamptz,
  confirm_token uuid not null default gen_random_uuid(),
  -- Added for the stage-two price test: what a family says when a price doesn't work.
  price_feedback text
);

-- The app saves emails in lower case. One row per email, so a repeat sign-up
-- updates the existing row instead of making a second one (spec section 9).
create unique index signups_email_unique on signups (lower(email));
create index on signups (email);
create unique index signups_confirm_token_unique on signups (confirm_token);

-- Row level security ON with NO policies: the public (browser) key can read and
-- write nothing. Only the server, using the secret service key, can touch this table.
alter table signups enable row level security;
