-- Kidzies core schema.
-- All tables live in the private "app" schema, which is not exposed through the
-- Supabase Data API. The web app reaches data only through the SECURITY DEFINER
-- functions in 20261025000002_api.sql, which resolve the caller from a session
-- token and enforce role and relationship checks inside the database.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists app;
revoke all on schema app from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
create table if not exists app.accounts (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student','parent','teacher','admin','admissions')),
  email extensions.citext unique,
  student_code text unique check (student_code ~ '^[A-Z0-9]{8}$'),
  password_hash text not null,
  display_name text not null,
  status text not null default 'active' check (status in ('active','suspended','pending')),
  is_demo boolean not null default false,
  is_protected boolean not null default false,
  password_changed_at timestamptz not null default now(),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_identifier check (
    (role = 'student' and student_code is not null and email is null) or
    (role <> 'student' and email is not null and student_code is null)
  )
);

create table if not exists app.sessions (
  token_hash text primary key,
  account_id uuid not null references app.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now()
);
create index if not exists sessions_account_idx on app.sessions(account_id);

create table if not exists app.login_attempts (
  id bigserial primary key,
  identifier text not null,
  client_key text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists login_attempts_ident_idx on app.login_attempts(identifier, attempted_at);
create index if not exists login_attempts_client_idx on app.login_attempts(client_key, attempted_at);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table if not exists app.profiles (
  account_id uuid primary key references app.accounts(id) on delete cascade,
  preferred_name text,
  sound_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists app.students (
  id uuid primary key default gen_random_uuid(),
  account_id uuid unique references app.accounts(id) on delete set null,
  first_name text not null,
  last_name text not null,
  nickname text,
  date_of_birth date,
  level text not null check (level in ('Pre-K','KG1','KG2')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app.guardians (
  id uuid primary key default gen_random_uuid(),
  account_id uuid unique references app.accounts(id) on delete set null,
  full_name text not null,
  email extensions.citext not null,
  phone text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists guardians_email_idx on app.guardians(email);

create table if not exists app.student_guardians (
  student_id uuid not null references app.students(id) on delete cascade,
  guardian_id uuid not null references app.guardians(id) on delete cascade,
  relationship text not null default 'Parent',
  created_at timestamptz not null default now(),
  primary key (student_id, guardian_id)
);

create table if not exists app.teachers (
  id uuid primary key default gen_random_uuid(),
  account_id uuid unique references app.accounts(id) on delete set null,
  full_name text not null,
  email extensions.citext not null unique,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Classes
-- ---------------------------------------------------------------------------
create table if not exists app.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null check (level in ('Pre-K','KG1','KG2')),
  school_year text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (name, school_year)
);

create table if not exists app.class_students (
  class_id uuid not null references app.classes(id) on delete cascade,
  student_id uuid not null references app.students(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index if not exists class_students_student_idx on app.class_students(student_id);

create table if not exists app.class_teachers (
  class_id uuid not null references app.classes(id) on delete cascade,
  teacher_id uuid not null references app.teachers(id) on delete cascade,
  is_lead boolean not null default true,
  primary key (class_id, teacher_id)
);
create index if not exists class_teachers_teacher_idx on app.class_teachers(teacher_id);

-- ---------------------------------------------------------------------------
-- Learning content
-- ---------------------------------------------------------------------------
create table if not exists app.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table if not exists app.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  subject_id uuid not null references app.subjects(id),
  level text not null check (level in ('Pre-K','KG1','KG2')),
  description text not null default '',
  objectives text[] not null default '{}',
  instructions text not null default '',
  activity_type text not null check (activity_type in ('multiple_choice','matching','counting','letter','shape','colour')),
  location text not null check (location in ('abc-garden','number-playground','animal-world','storytime','shapes-colours','creative-studio','life-skills')),
  media_url text,
  questions jsonb not null default '[]'::jsonb,
  pass_mark integer not null default 60 check (pass_mark between 0 and 100),
  points_per_question integer not null default 1 check (points_per_question between 1 and 10),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references app.teachers(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.lesson_activities (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  location text not null,
  description text not null,
  is_available boolean not null default true
);

create table if not exists app.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references app.lessons(id) on delete cascade,
  class_id uuid references app.classes(id) on delete cascade,
  student_id uuid references app.students(id) on delete cascade,
  assigned_by uuid references app.teachers(id) on delete set null,
  due_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  constraint assignments_target check ((class_id is null) <> (student_id is null))
);
create index if not exists assignments_class_idx on app.assignments(class_id);
create index if not exists assignments_student_idx on app.assignments(student_id);

create table if not exists app.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references app.students(id) on delete cascade,
  activity_key text not null,
  assignment_id uuid references app.assignments(id) on delete set null,
  lesson_id uuid references app.lessons(id) on delete set null,
  score integer not null check (score >= 0),
  max_score integer not null check (max_score > 0 and score <= max_score),
  stars integer not null check (stars between 0 and 3),
  answers jsonb not null default '[]'::jsonb,
  mistakes jsonb not null default '[]'::jsonb,
  duration_seconds integer,
  completed_at timestamptz not null default now()
);
create index if not exists attempts_student_idx on app.activity_attempts(student_id, completed_at desc);
create index if not exists attempts_assignment_idx on app.activity_attempts(assignment_id);

create table if not exists app.assessment_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references app.activity_attempts(id) on delete cascade,
  teacher_id uuid references app.teachers(id) on delete set null,
  feedback text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.student_progress (
  student_id uuid not null references app.students(id) on delete cascade,
  activity_key text not null,
  completions integer not null default 0,
  best_score_pct integer not null default 0,
  best_stars integer not null default 0,
  last_played_at timestamptz,
  primary key (student_id, activity_key)
);

create table if not exists app.achievements (
  key text primary key,
  title text not null,
  description text not null,
  icon text not null
);

create table if not exists app.student_achievements (
  student_id uuid not null references app.students(id) on delete cascade,
  achievement_key text not null references app.achievements(key),
  earned_at timestamptz not null default now(),
  primary key (student_id, achievement_key)
);

create table if not exists app.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references app.students(id) on delete cascade,
  class_id uuid not null references app.classes(id) on delete cascade,
  day date not null,
  status text not null check (status in ('present','absent','late','excused')),
  note text,
  recorded_by uuid references app.teachers(id) on delete set null,
  unique (student_id, class_id, day)
);

create table if not exists app.observations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references app.students(id) on delete cascade,
  teacher_id uuid references app.teachers(id) on delete set null,
  note text not null,
  share_with_family boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'families' check (audience in ('families','staff','all')),
  class_id uuid references app.classes(id) on delete cascade,
  is_demo boolean not null default false,
  published_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admissions
-- ---------------------------------------------------------------------------
create table if not exists app.admission_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  child_first_name text not null,
  child_last_name text not null,
  child_date_of_birth date not null,
  requested_level text not null check (requested_level in ('Pre-K','KG1','KG2')),
  guardian_name text not null,
  guardian_email extensions.citext not null,
  guardian_phone text not null,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes_from_family text,
  consent_data boolean not null,
  consent_terms boolean not null,
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','information_required','accepted','rejected','enrolled')),
  decision_note text,
  student_id uuid unique references app.students(id) on delete set null,
  is_demo boolean not null default false,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_status_idx on app.admission_applications(status);

create table if not exists app.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references app.admission_applications(id) on delete cascade,
  file_name text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/png','image/jpeg')),
  size_bytes integer not null check (size_bytes between 1 and 2097152),
  content bytea not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists app.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references app.admission_applications(id) on delete cascade,
  author_account_id uuid references app.accounts(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Operations
-- ---------------------------------------------------------------------------
create table if not exists app.school_settings (
  id integer primary key default 1 check (id = 1),
  school_name text not null default 'Kidzies Demo School',
  contact_email text not null default 'hello@school.example',
  school_year text not null default '2026/27',
  daily_goal integer not null default 3 check (daily_goal between 1 and 10),
  demo_mode boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists app.audit_logs (
  id bigserial primary key,
  actor_account_id uuid references app.accounts(id) on delete set null,
  actor_role text,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on app.audit_logs(created_at desc);

-- Row Level Security: enabled everywhere with no policies, so even if the
-- schema were exposed by mistake, anon/authenticated roles could read nothing.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'app' loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('revoke all on app.%I from public, anon, authenticated', t.tablename);
  end loop;
end $$;
