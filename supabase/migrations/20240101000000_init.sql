-- Extensions
create extension if not exists "pgcrypto";

-- Types enum
create type role_t as enum ('candidat','evaluateur','jury','admin');
create type dimension_t as enum ('PEOPLE','EXECUTION','BUSINESS','IMPACT');
create type stage_t as enum ('REPERAGE','QUALIFICATION','ENTRETIEN','IMMERSION','DECISION');
create type decision_t as enum ('SELECTION_PRIORITAIRE','ACCOMPAGNEMENT_CIBLE','PRE_INCUBATION','NON_RETENU_A_CE_STADE','COMPLEMENT_REQUIS');

-- Tables principales
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  org_id uuid references organizations(id),
  role role_t not null default 'candidat',
  full_name text,
  phone text,
  locale text default 'fr',
  created_at timestamptz default now()
);

create table programs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  name text not null,
  opens_at date,
  closes_at date,
  scoring_model_id uuid,
  status text default 'draft',
  created_at timestamptz default now()
);

create table scoring_models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version int not null,
  is_active boolean default false,
  config jsonb not null,
  created_at timestamptz default now(),
  unique(name, version)
);

create table criteria (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references scoring_models(id) on delete cascade,
  code text not null,
  dimension dimension_t not null,
  label text not null,
  weight numeric not null check (weight > 0),
  position int not null,
  unique(model_id, code)
);

create table candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  region text,
  sector text,
  gender text,
  business_stage text,
  formalization text check (formalization in ('INFORMEL_PUR','SEMI_FORMEL','FORMALISE','STRUCTURE')),
  persona text check (persona in ('A','B','C','D','E')),
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id),
  program_id uuid not null references programs(id),
  stage stage_t not null default 'REPERAGE',
  submitted_at timestamptz,
  created_at timestamptz default now(),
  unique(candidate_id, program_id)
);

create table prequal_questions (
  id serial primary key,
  position int not null,
  text text not null,
  help text,
  proof_hint text
);

create table prequal_answers (
  application_id uuid references applications(id) on delete cascade,
  question_id int references prequal_questions(id),
  answer text,
  proof_path text,
  no_proof_reason text,
  updated_at timestamptz default now(),
  primary key (application_id, question_id)
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  evaluator_id uuid not null references profiles(id),
  kind text not null check (kind in ('PREQUAL','INTERVIEW','ASSESSMENT','CHALLENGE')),
  status text not null default 'draft' check (status in ('draft','submitted')),
  submitted_at timestamptz,
  created_at timestamptz default now(),
  unique(application_id, evaluator_id, kind)
);

create table evaluation_scores (
  evaluation_id uuid references evaluations(id) on delete cascade,
  criterion_id uuid references criteria(id),
  note smallint check (note between 1 and 5),
  evidences text[] default '{}',
  strong_proof boolean default false,
  to_verify boolean default false,
  comment text,
  primary key (evaluation_id, criterion_id)
);

create table star_questions (
  id serial primary key,
  competency text not null,
  question text not null,
  follow_up text
);

create table assessment_exercises (
  id serial primary key,
  name text not null,
  scenario text not null,
  behaviors text
);

create table exercise_scores (
  evaluation_id uuid references evaluations(id) on delete cascade,
  exercise_id int references assessment_exercises(id),
  note smallint check (note between 1 and 5),
  observations text,
  primary key (evaluation_id, exercise_id)
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  type text not null,
  facts text not null,
  source text not null,
  raised_by uuid references profiles(id),
  status text default 'open',
  created_at timestamptz default now()
);

create table jury_decisions (
  application_id uuid primary key references applications(id) on delete cascade,
  decision decision_t not null,
  final_score numeric,
  model_id uuid references scoring_models(id),
  two_proofs text[],
  two_risks text[],
  strengths text[],
  to_develop text[],
  justification text not null,
  conditions text,
  plan_90d text,
  decided_by uuid references profiles(id),
  decided_at timestamptz default now()
);

create table followups (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  month smallint check (month in (6,12,24)),
  metrics jsonb,
  recorded_at timestamptz default now()
);

create table consents (
  candidate_id uuid references candidates(id) on delete cascade,
  purpose text not null,
  version text not null,
  granted_at timestamptz default now(),
  primary key (candidate_id, purpose, version)
);

create table audit_log (
  id bigserial primary key,
  actor uuid,
  action text not null,
  entity text,
  entity_id uuid,
  diff jsonb,
  at timestamptz default now()
);

-- Index
create index idx_applications_candidate on applications(candidate_id);
create index idx_applications_program on applications(program_id);
create index idx_evaluations_application on evaluations(application_id);
create index idx_evaluations_evaluator on evaluations(evaluator_id);
create index idx_audit_log_actor on audit_log(actor);
create index idx_audit_log_entity on audit_log(entity, entity_id);
