-- Anonymous usage stats for MP2K (no names, no IP).
create table if not exists mp2k_visitors (
  visitor_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  visit_count integer not null default 0
);

create table if not exists mp2k_events (
  id serial primary key,
  visitor_id text not null,
  kind text not null,
  how text,
  created_at timestamptz not null default now()
);

create index if not exists mp2k_events_kind_created_idx
  on mp2k_events (kind, created_at desc);

create index if not exists mp2k_events_visitor_idx
  on mp2k_events (visitor_id);
