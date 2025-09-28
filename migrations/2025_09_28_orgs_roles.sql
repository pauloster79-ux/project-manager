-- 1) organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 2) org_users (org-level roles)
create type org_role as enum ('owner','admin','member','viewer');

create table if not exists org_users (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role org_role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists org_users_org_id_idx on org_users(org_id);
create index if not exists org_users_user_id_idx on org_users(user_id);

-- 3) invitations
create type invite_status as enum ('pending','accepted','expired','revoked');

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role org_role not null default 'member',
  token text not null,
  status invite_status not null default 'pending',
  invited_by uuid references users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_user_id uuid references users(id)
);

create index if not exists invitations_org_email_idx on invitations(org_id, email);

-- 4) add org_id to project-scoped tables
alter table projects add column if not exists org_id uuid;
alter table attachments add column if not exists org_id uuid;
alter table vectors add column if not exists org_id uuid;
alter table audit_log add column if not exists org_id uuid;

-- 5) backfill orgs (single default org for existing data)
do $$
declare
  default_org uuid;
begin
  -- create a default org if none
  if (select count(*) from organizations) = 0 then
    insert into organizations (name) values ('Default Org') returning id into default_org;
  else
    select id into default_org from organizations order by created_at asc limit 1;
  end if;

  -- set projects.org_id
  update projects set org_id = coalesce(org_id, default_org);

  -- cascade org_id to attachments/vectors/audit_log from project
  update attachments a
    set org_id = p.org_id
    from projects p
    where a.project_id = p.id and a.org_id is null;

  update vectors v
    set org_id = p.org_id
    from projects p
    where v.project_id = p.id and v.org_id is null;

  update audit_log al
    set org_id = p.org_id
    from projects p
    where al.project_id = p.id and al.org_id is null;

  -- Make not null going forward
  alter table projects alter column org_id set not null;
  alter table attachments alter column org_id set not null;
  alter table vectors alter column org_id set not null;
  alter table audit_log alter column org_id set not null;
end $$;

-- 6) foreign keys and indexes
alter table projects
  add constraint projects_org_fk foreign key (org_id) references organizations(id) on delete cascade;

create index if not exists projects_org_id_idx on projects(org_id);
create index if not exists attachments_org_id_idx on attachments(org_id);
create index if not exists vectors_org_id_idx on vectors(org_id);
create index if not exists audit_log_org_id_idx on audit_log(org_id);

-- 7) project roles are already in memberships (pm/member/viewer); ensure helpful index:
create index if not exists memberships_user_project_idx on memberships(user_id, project_id);
