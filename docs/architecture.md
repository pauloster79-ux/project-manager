AI PM Hub — Detailed Architecture & Build Spec (MVP: Risks + Decisions)
0) North Star
Every update to a Risk or Decision is validated at the point of capture by an AI Quality Gateway. The gateway runs deterministic checks and an LLM review with project context, returns issues and a single consolidated Proposed Update, and only then do we commit to the DB (or save as Draft). Documents are stored, chunked, and embedded so the AI can reason and cite evidence.

2) System Overview
[ Web App (Next.js + Tailwind Catalyst) ]
    | onBlur/Save -> /validate
    | Issues Panel (Proposed Update + chat)
    v
[ API (Next API routes) + Quality Gateway ]
    |      |                 \
    |      |                  \__ LLM Client (provider-agnostic)
    |      |                          ^
    |      v                          |
  Postgres (tables) <--- Retrieval ---/  pgvector (vectors)
    ^
    |
[ Background Worker (pg-boss) ] --> embed:entity, embed:document, reports, scans
    ^
    |
[ Messaging Channels (Adapters: Teams/Email/...) ]
    propose -> approve -> PATCH
    ^
    |
  inbound events (verify + normalize)
    \
     S3-compatible Object Storage (private; pre-signed URLs)


2.1 Frontend (Next.js + Tailwind Catalyst) — Deep Dive
Pages
Project Dashboard: tabs — Risks, Decisions, Documents, Q&A.


Risks List → Risk Detail


Decisions List → Decision Detail


Forms (Catalyst components)
Inputs: Input, Textarea, Select, DatePicker (Catalyst), Badge, Button, Sheet/Dialog, Toast.


RiskForm fields: title, summary, owner, probability(1..5), impact(1..5), exposure (derived), mitigation, next_review_date, plus gateway meta (validation_status, validation_score).


DecisionForm fields: title, detail, status (Proposed|Approved|Rejected), decided_by, decided_on.


Validation UX
Inline Issue Chips: per-field hints with Apply Fix (e.g., “Next review is in the past — set to 2025-10-03? [Apply]”).


Issues Panel (right Sheet):


Suggested Update card: diff (Before → After), checklist to include/exclude fields, Apply Suggested Update.


Why?: rationale + citations (links to Risk/Decision/doc snippet).


Conversation pane: mini-chat scoped to the current entity/proposal; quick actions (“Shorten”, “+3 days”, “Clarify owner”).


Save states: Save (valid), Save as Draft (minor), Blocked (critical; Save disabled).


Interaction flow (per entity)
User edits → on blur (or Save) → POST /api/validate/risk|decision with diff.


UI renders chips; if notable issues, open Issues Panel with Proposed Update.


User can iterate via panel chat (POST /api/issues/iterate) until satisfied.


Apply Suggested Update → PATCH /api/risks/:id | /api/decisions/:id (atomic write).


Toast “Applied”; background job embed:entity runs.


Client libraries
React Hook Form + Zod (local checks; date/enum/range)


TanStack Query (queries/mutations; 409 retry flow)


date-fns (formatting; Europe/London)


lucide-react (icons)


State machine (client)
idle → validating → reviewing(panel) → applying → committed.


Handle 409 Conflict by fetching fresh, re-running validate, updating the proposal.


Accessibility
Proper labels, aria-describedby for errors, keyboard focus management in Sheet/Dialog, announce new issues via aria-live.



2.2 API & Quality Gateway (Node) — Deep Dive
Endpoints
Validation (Quality Gateway)
POST /api/validate/risk


POST /api/validate/decision


Request
{ "project_id":"uuid", "entity_id":"uuid (optional for create)", "diff": { "changed": "fields only" } }

Response
{
  "validation_score": 0-100,
  "blocked": false,
  "issues": [
    {"severity":"critical|major|minor","type":"missing|contradiction|clarity|format","message":"...", "refs":["..."], "suggested_fix":"..."}
  ],
  "required_questions": ["..."],
  "safe_fixes": {"normalized_fields": {"...": "..."}, "grammar_rewrite":"..."},
  "proposed_patch": {"field":"value", "...":"..."},
  "rationale": "why these changes",
  "coherence_refs": ["ids..."],
  "llm_snapshot_id": "gw:v1|model:...|rules:YYYY-MM-DD|..."
}

CRUD
Risks: GET /api/risks?project_id, GET /api/risks/:id, POST /api/risks, PATCH /api/risks/:id


Decisions: mirror the above.


PATCH request
{
  "patch": { "field":"value", "...":"..." },
  "llm_snapshot_id": "optional",
  "if_match_updated_at": "2025-09-26T10:11:12.000Z",
  "audit_context": { "source":"ui|channel|api", "reason":"apply_proposed_patch" }
}

Server re-runs schema/rules and a light gateway (if needed) → writes or returns 409 with message.


Issues Panel iteration
POST /api/issues/iterate


{ "project_id":"uuid", "entity_type":"risk|decision", "entity_id":"uuid", "current_proposed_patch":{...}, "user_message":"Refine..." }

→ { "revised_proposed_patch":{...}, "rationale":"...", "followup_questions":[], "citations":[...] }
Q&A
POST /api/qa → { "project_id":"uuid", "question":"..." }
 → { "answer":"...", "citations":[{type:"risk|decision|attachment_chunk", ...}] }


Documents
POST /api/documents/upload → presigned URL


POST /api/documents/commit


Reports
POST /api/reports/generate ; GET /api/reports/:id


Messaging (channel-agnostic)
POST /api/messaging/events (inbound; adapter verifies & normalizes)


POST /api/messaging/interactive (approvals/edits)


POST /api/messaging/propose-update (render+send)


POST /api/messaging/send (internal send)


Quality Gateway pipeline
Schema checks (Zod): types/enums/ranges/required (server side).


Business rules (deterministic):


Risk: exposure = probability × impact (derived); if high exposure ⇒ require owner + next_review_date.


Decision: if status in {Approved,Rejected} ⇒ require decided_by + decided_on (and decided_on ≤ today soft rule).


Context retrieval:


Neighbors: linked items/attachments.


Vector hits: risk|decision|attachment_chunk via pgvector cosine distance (top-K).


LLM review (low temperature, JSON strict):


Return issues[], required_questions[], single proposed_patch, rationale, coherence_refs.


Decision:


Mark blocked=true only for contradictions/critical misses.


Client may auto-apply safe_fixes (typos/normalizations) and re-validate.


Messaging Adapters
Interface
interface ChannelAdapter {
  id: 'msteams'|'email'|'googlechat'|'webhook'|string;
  verifyInbound(req): Promise<InboundEvent>;
  renderProposal(patch, entity): ChannelMessage;  // Adaptive Card / HTML / etc.
  sendMessage(target, message: ChannelMessage): Promise<void>;
}

Account linking: channel_identities(user_id, channel, channel_user_id, display_name).


Flow: event → parse diff → validate → if questions → ask; else Proposed Update → Approve → PATCH → audit.


Error model
JSON errors: {"error":{"code":"BAD_REQUEST|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|CONFLICT|VALIDATION_FAILED|LLM_TIMEOUT","message":"..."}}


409 for stale updated_at.


429 rate limit on validate, iterate, qa.



2.3 Database (Postgres + pgvector) — Deep Dive
UUID PKs, timestamptz, foreign keys, indices; pgvector for semantic search.
Core tables (SQL)
create extension if not exists pgcrypto;
create extension if not exists vector;

-- projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- memberships
create table memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  role text not null check (role in ('owner','pm','member','viewer')),
  unique (user_id, project_id)
);
create index idx_memberships_project on memberships(project_id);

-- risks
create table risks (
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
create index idx_risks_project on risks(project_id);
create index idx_risks_exposure on risks(project_id, exposure desc);

-- decisions
create table decisions (
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
create index idx_decisions_project on decisions(project_id);
create index idx_decisions_status on decisions(project_id, status);

-- attachments (file metadata)
create table attachments (
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
create index idx_attachments_project on attachments(project_id);
create index idx_attachments_entity on attachments(entity_type, entity_id);

-- vectors (semantic index)
create table vectors (
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
create index idx_vectors_project on vectors(project_id);
create index idx_vectors_source on vectors(source_type, source_id);
create index idx_vectors_embedding on vectors using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null check (kind in ('weekly','exec','client')),
  params jsonb,
  storage_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index idx_reports_project on reports(project_id);

-- audit log
create table audit_log (
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
create index idx_audit_project on audit_log(project_id);
create index idx_audit_entity on audit_log(entity_type, entity_id);
create index idx_audit_created on audit_log(created_at);

Concurrency
Entities carry updated_at.


Client sends if_match_updated_at. On mismatch, 409 → refetch, re-validate, re-apply proposal.


Typical queries
Top risks by exposure:


select id, title, exposure, probability, impact
from risks
where project_id = $1
order by exposure desc
limit 20;

Vector search (attachment chunks only):


select source_id as attachment_id, chunk_index, chunk_text,
       1 - (embedding <=> $2) as similarity, metadata
from vectors
where project_id = $1 and source_type = 'attachment_chunk'
order by embedding <=> $2
limit $3;


2.4 Object Storage (Documents) — Deep Dive
Flow
POST /api/documents/upload → server validates type/size, creates attachment_id, S3 pre-signed URL & storage_key.


Browser PUTs file to URL (direct to S3).


POST /api/documents/commit → write attachments row; enqueue embed:document.


Request: upload
{ "project_id":"uuid", "filename":"Minutes.pdf", "mime_type":"application/pdf", "size_bytes": 1048576, "entity_type":"risk", "entity_id":"uuid" }

Response
{ "attachment_id":"uuid", "upload_url":"https://s3...signed", "storage_key":"projects/<pid>/attachments/<aid>/minutes.pdf" }

Worker job: embed:document
Extract text: pdf/docx/txt/md/eml (+ optional OCR for images).


Chunk: target ~800 tokens, 100 overlap; keep page refs if available.


Embed: batch via LLMClient.embed; insert vectors rows with source_type='attachment_chunk'.


Status: set text_extract_status='ok'|'failed'; log errors to attachments.error_log.


Security
Private bucket, server-side encryption.


Pre-signed URLs (short TTL) for upload/download.


Enforce MIME whitelist and size cap.


Optional virus scan before indexing.


UI
Documents tab: upload, list, filter, link/unlink to Risk/Decision, preview.


Entity detail: show linked docs + top relevant snippets; “Insert snippet into proposal”.



2.5 LLM & Retrieval — Deep Dive
LLM Client (provider-agnostic)
export type CompleteArgs = {
  system: string;
  user: string;         // JSON or text
  schemaName?: 'gateway'|'iterate'|'qa'|'summary';
  temperature?: number; // 0.2–0.4 gateway; ≤0.7 qa
  maxTokens?: number;
  jsonStrict?: boolean; // enforce JSON and retry
  timeoutMs?: number;
};
export async function complete(args: CompleteArgs): Promise<string> {}
export async function embed(texts: string[]): Promise<number[][]> {}

jsonStrict: validate + retry with “return valid JSON only”.


Timeouts: gateway 8s (1 retry), iterate 6s, QA 20s.


Retrieval utilities
export async function getNeighborsForRisk(id: string) { /* linked decisions, attachments */ }
export async function getNeighborsForDecision(id: string) { /* linked risks, attachments */ }

export async function searchVectors(projectId: string, queryEmbedding: number[], k: number, sourceTypes: Array<'risk'|'decision'|'attachment_chunk'>) { /* cosine */ }

export function packContext({ entitySnapshot, neighbors, vectorHits, maxItems=10 }) {
  // return compact entity_summary, related_summaries[], doc_snippets[]
}

MMR re-rank to diversify results; prefer entities for Gateway; cap doc snippets to 3.


Prompts (versioned; hashed → llm_snapshot_id)
Gateway — System
You are the AI Quality Gateway. Ensure updates are clear, complete, coherent with existing project data, and actionable. Identify issues (missing/contradiction/clarity/format), ask minimal essential questions, and return a single best proposed_patch that resolves critical issues without inventing facts. Output strict JSON per schema.
Iterate — System
You refine the current proposed_patch per user instruction. Keep changes minimal; respect business rules; return revised patch + rationale.
QA — System
Answer using only provided context; cite the risks/decisions/doc snippets used; say if unknown.
Gateway output schema (same as 2.2).
Canonical summaries for embeddings
Risk: RISK <short-id> | <title> | p<prob> i<impact> exp<exposure> | Owner:<name> | NextReview:<date> | Mitigation:<short>


Decision: DECISION <short-id> | <title> | Status:<status> | DecidedBy:<name?> | <date?>


Budgets & latency
Gateway input ≤ ~2k tokens; output ≤ 500.


Iterate input ≤ 800; output ≤ 300.


QA context ≤ ~1.5k; answer ≤ 400.


P95 targets: Gateway ≤ 1.5s; Iterate ≤ 1.2s; QA ≤ 2.5s.



2.6 Background Worker (pg-boss) — Deep Dive
Jobs
embed:entity { project_id, entity_type:'risk'|'decision', entity_id, reason }


embed:document { project_id, attachment_id, storage_key, mime_type, filename, sha256? }


report:generate { project_id, kind:'weekly'|'exec'|'client', params?, requested_by? }


health:scan { project_id, scope:'high-exposure'|'stale'|'all' }


nudge:channel { project_id, channel, channel_user_id, message, entity_type?, entity_id?, proposed_patch? }


Schedules (Europe/London)
Nightly health:scan (02:15 local).


Weekly report:generate (Mon 08:30) — optional.


Idempotency
Upsert vectors keyed by (project_id, source_type, source_id).


Document de-dup via sha256.


pg-boss singletonKey to avoid duplicate enqueues.


Concurrency & retries (starting points)
Concurrency: 4–8 workers.


embed:entity 10s timeout, 2 retries.


embed:document 120s timeout, 2 retries.


report:generate 60s, 1 retry.


health:scan 60s, 1 retry.


Observability
Log start/end/duration; expose simple metrics (/api/admin/metrics) for counts & durations.


Store failures in DLQ; small admin control to requeue.



2.7 Auth & Roles
Providers (Auth.js)
Microsoft Entra ID (Azure AD), Google, Email magic link, Generic OIDC (Okta/Auth0/Keycloak).


Domain allowlists optionally enforced per org.


Sessions & roles
JWT sessions; claims: user_id, org_id, roles.


memberships.role: owner|pm|member|viewer.


Permissions:


viewer: read only


member: create/edit, cannot apply when blocked=true


pm|owner: can apply Proposed Update even when blocked



2.8 Messaging Channels (Adapters)
Adapter interface (recap)
interface ChannelAdapter {
  id: string;
  verifyInbound(req): Promise<InboundEvent>;
  renderProposal(patch, entity): ChannelMessage;
  sendMessage(target, message: ChannelMessage): Promise<void>;
}

Generic endpoints
POST /api/messaging/events


POST /api/messaging/interactive


POST /api/messaging/propose-update


POST /api/messaging/send


Account linking
channel_identities(user_id, channel, channel_user_id, display_name, linked_at)


First contact: send magic link to connect channel to hub user.


Example behaviours
Teams: Adaptive Cards for approval/edit.


Email: HTML proposal with Approve link (opens web panel) or “reply APPROVE”.


Google Chat/others: similar to Teams with rich cards.



2.9 Observability & Audit
pino structured logs with requestId.


Optional Sentry for error reporting.


audit_log on every mutation: who, what, when, before/after, issues, llm_snapshot_id, actor_source.



2.10 Security & Compliance
Enforce project scoping on every query (and later RLS).


Sanitize all AI text before rendering (or render plain text).


Secrets only server-side; rotate as needed.


S3: private, pre-signed URLs, SSE encryption.


Document PII minimization; deletion & export paths.



2.11 Performance & Cost
Validate on blur/save only; debounce calls.


Strict context caps; prefer neighbors over heavy vector hits.


Batch embeddings; hash to avoid re-embedding unchanged text.


Index tuning: only necessary indices in 2.3.



2.12 Deployment (Render-friendly)
Services
Web: Next.js (App Router) + API routes.


Worker: Node process running pg-boss handlers.


Postgres: enable pgvector.


Object storage: S3/B2/R2/Supabase.


Start commands
Web: next start (or standalone output).


Worker: node workers/index.js (or tsx workers/index.ts).



2.13 Environment Variables (starter set)
# Auth (Microsoft/Google/Email/OIDC)
NEXTAUTH_URL=
NEXTAUTH_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OIDC_ISSUER=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=

# DB / Queue
DATABASE_URL=
BOSS_SCHEMA=boss
WORKER_ENABLED=true
WORKER_CONCURRENCY=6

# LLM / Embeddings
LLM_PROVIDER=openai|anthropic|azure|...
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-large
LLM_TIMEOUT_MS=8000
LLM_JSON_STRICT=true

# Retrieval
RETRIEVAL_K=10
RETRIEVAL_DOC_CHUNKS=3
RETRIEVAL_LAMBDA=0.7

# Storage
S3_ENDPOINT=
S3_BUCKET=pm-hub-docs
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
DOC_MAX_UPLOAD_MB=25
DOC_ALLOWED_MIME=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,message/rfc822,image/png,image/jpeg
VIRUS_SCAN_ENABLED=true
OCR_ENABLED=false

# App
APP_BASE_URL=
APP_TIMEZONE=Europe/London


2.14 Testing Strategy
Unit: deterministic rules; Zod schemas; context packer; MMR; prompt snapshot tests.


Integration: /api/validate/risk|decision (mock LLM), /api/documents/*, vector search sanity.


E2E: create Risk → validate → apply → vectors exist → QA cites it.


Worker: run embed:document over a small PDF; assert vectors insertions.



2.15 Acceptance Criteria (MVP)
All Risk/Decision updates pass through Quality Gateway.


Issues Panel offers a single Proposed Update and chat refinement.


Messaging channels support propose → approve → commit loop.


Q&A returns grounded answers with citations.


Documents uploaded → indexed (chunks + embeddings) → retrievable in validation/QA.


audit_log populated with before/after, issues, llm_snapshot_id.


P95 validation latency ≤ 1.5s with compact context.



Glossary (quick)
Proposed Update / proposed_patch: AI’s consolidated diff to apply in one click.


Neighbors: directly linked items/attachments for context.


pgvector: Postgres extension for vector similarity search.


MMR: Maximal Marginal Relevance, a simple diversification method for retrieval.


Pre-signed URL: short-lived URL granting temporary access to a private object.


Singleton key: pg-boss mechanism to dedupe concurrent jobs.




