-- Extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- Memberships
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  role text not null check (role in ('owner','pm','member','viewer')),
  unique (user_id, project_id)
);
create index if not exists idx_memberships_project on memberships(project_id);

-- Risks
create table if not exists risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  summary text,
  owner_id uuid references users(id),
  probability smallint not null check (probability between 1 and 5),
  impact smallint not null check (impact between 1 and 5),
  exposure smallint generated always as (probability * impact) stored,
  mitigation text,
  next_review_date date,
  validation_status text not null default 'draft' check (validation_status in ('valid','draft','blocked')),
  validation_score int check (validation_score between 0 and 100),
  issues jsonb,
  ai_rewrite text,
  coherence_refs jsonb,
  provenance jsonb,
  llm_snapshot_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_risks_project on risks(project_id);
create index if not exists idx_risks_exposure on risks(project_id, exposure desc);

-- Decisions
create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  detail text,
  decided_by uuid references users(id),
  decided_on date,
  status text not null check (status in ('Proposed','Approved','Rejected')),
  validation_status text not null default 'draft' check (validation_status in ('valid','draft','blocked')),
  validation_score int check (validation_score between 0 and 100),
  issues jsonb,
  ai_rewrite text,
  coherence_refs jsonb,
  provenance jsonb,
  llm_snapshot_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_decisions_project on decisions(project_id);
create index if not exists idx_decisions_status on decisions(project_id, status);

-- Attachments (file metadata; bytes live in object storage)
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  entity_type text check (entity_type in ('risk','decision')),
  entity_id uuid not null,
  filename text not null,
  mime_type text,
  storage_key text not null,
  size_bytes bigint,
  sha256 text,
  text_extract_status text not null default 'pending' check (text_extract_status in ('pending','ok','failed')),
  uploaded_by uuid references users(id),
  uploaded_at timestamptz not null default now(),
  error_log text
);
create index if not exists idx_attachments_project on attachments(project_id);
create index if not exists idx_attachments_entity on attachments(entity_type, entity_id);

-- Vectors (semantic index)
create table if not exists vectors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_type text not null check (source_type in ('risk','decision','attachment_chunk')),
  source_id uuid not null,
  chunk_index int not null default 0,
  chunk_text text not null,
  embedding vector(1536) not null,
  metadata jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists idx_vectors_project on vectors(project_id);
create index if not exists idx_vectors_source on vectors(source_type, source_id);
-- pgvector IVF index (optional until you have enough rows)
do $$
begin
  execute 'create index if not exists idx_vectors_embedding on vectors using ivfflat (embedding vector_cosine_ops) with (lists = 100)';
exception when others then
  -- ivfflat may fail if extension not fully available; safe to ignore here
  null;
end $$;

-- Reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null check (kind in ('weekly','exec','client')),
  params jsonb,
  storage_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_project on reports(project_id);

-- Audit log
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  actor_user_id uuid,
  actor_source text not null check (actor_source in ('ui','channel','api','worker')),
  entity_type text not null check (entity_type in ('risk','decision')),
  entity_id uuid not null,
  action text not null check (action in ('create','update','validate','approve','reject')),
  before jsonb,
  after jsonb,
  issues jsonb,
  llm_snapshot_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_project on audit_log(project_id);
create index if not exists idx_audit_entity on audit_log(entity_type, entity_id);
create index if not exists idx_audit_created on audit_log(created_at);
