-- Internal helpers (schema "app", never callable from the Data API).

create or replace function app.hash_token(p_token text) returns text
language sql immutable set search_path = app, extensions as $$
  select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create or replace function app.hash_password(p_password text) returns text
language sql volatile set search_path = app, extensions as $$
  select extensions.crypt(p_password, extensions.gen_salt('bf', 10))
$$;

-- Resolve the session owner without raising. Returns null when the session is
-- missing, expired, or the account is not active.
create or replace function app.try_actor(p_token text) returns app.accounts
language plpgsql set search_path = app, extensions as $$
declare
  v app.accounts;
  v_hash text := app.hash_token(p_token);
begin
  if p_token is null or length(p_token) < 32 then return null; end if;
  select a.* into v
    from app.sessions s join app.accounts a on a.id = s.account_id
   where s.token_hash = v_hash and s.expires_at > now() and a.status = 'active';
  if not found then return null; end if;
  -- Sliding expiry: extend sessions that are actively used.
  update app.sessions
     set last_seen_at = now(),
         expires_at = greatest(expires_at, now() + interval '8 hours')
   where token_hash = v_hash and last_seen_at < now() - interval '5 minutes';
  return v;
end $$;

create or replace function app.require_role(p_token text, p_roles text[]) returns app.accounts
language plpgsql set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.try_actor(p_token);
  if v.id is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  if not (v.role = any(p_roles)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return v;
end $$;

create or replace function app.audit(p_actor app.accounts, p_action text, p_type text, p_id text, p_details jsonb default '{}'::jsonb)
returns void language sql set search_path = app as $$
  insert into app.audit_logs(actor_account_id, actor_role, action, target_type, target_id, details)
  values (p_actor.id, p_actor.role, p_action, p_type, p_id, coalesce(p_details, '{}'::jsonb));
$$;

-- Eight characters, uppercase letters and digits, without look-alikes (0/O, 1/I/L).
create or replace function app.new_student_code() returns text
language plpgsql set search_path = app, extensions as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_bytes bytea;
  i int;
begin
  loop
    v_code := '';
    v_bytes := extensions.gen_random_bytes(8);
    for i in 0..7 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
    end loop;
    exit when not exists (select 1 from app.accounts where student_code = v_code);
  end loop;
  return v_code;
end $$;

-- Friendly one-time passwords such as "Sunny-Panda-482".
create or replace function app.new_temp_password() returns text
language plpgsql set search_path = app, extensions as $$
declare
  v_adj text[] := array['Sunny','Happy','Brave','Bright','Jolly','Lucky','Kind','Gentle','Bouncy','Cosy','Merry','Clever'];
  v_noun text[] := array['Panda','Tiger','Rocket','Rainbow','Koala','Dolphin','Comet','Turtle','Penguin','Puffin','Lion','Otter'];
  v_b bytea := extensions.gen_random_bytes(4);
begin
  return v_adj[(get_byte(v_b,0) % 12) + 1] || '-' || v_noun[(get_byte(v_b,1) % 12) + 1] || '-' ||
         lpad(((get_byte(v_b,2) * 256 + get_byte(v_b,3)) % 1000)::text, 3, '0');
end $$;

create or replace function app.stars_for(p_score int, p_max int) returns int
language sql immutable as $$
  select case when p_max <= 0 then 0
              when p_score::numeric / p_max >= 0.9 then 3
              when p_score::numeric / p_max >= 0.6 then 2
              else 1 end
$$;

-- Demo accounts only ever see demo records.
create or replace function app.visible(p_actor app.accounts, p_is_demo boolean) returns boolean
language sql immutable as $$ select (not p_actor.is_demo) or p_is_demo $$;

create or replace function app.teacher_id_for(p_actor app.accounts) returns uuid
language sql stable set search_path = app as $$
  select id from app.teachers where account_id = p_actor.id
$$;

create or replace function app.teacher_has_student(p_teacher uuid, p_student uuid) returns boolean
language sql stable set search_path = app as $$
  select exists (
    select 1 from app.class_teachers ct
      join app.class_students cs on cs.class_id = ct.class_id
     where ct.teacher_id = p_teacher and cs.student_id = p_student)
$$;

create or replace function app.teacher_has_class(p_teacher uuid, p_class uuid) returns boolean
language sql stable set search_path = app as $$
  select exists (select 1 from app.class_teachers where teacher_id = p_teacher and class_id = p_class)
$$;

-- Assignments that apply to a student, either directly or through a class.
create or replace function app.student_assignments(p_student uuid) returns setof app.assignments
language sql stable set search_path = app as $$
  select a.* from app.assignments a
   where a.student_id = p_student
      or a.class_id in (select class_id from app.class_students where student_id = p_student)
$$;

create or replace function app.area_name(p_key text) returns text
language sql immutable as $$
  select case p_key
    when 'abc-garden' then 'Alphabet Garden'
    when 'number-playground' then 'Number Playground'
    when 'animal-world' then 'Animal World'
    when 'storytime' then 'Storytime Corner'
    when 'shapes-colours' then 'Shapes & Colours'
    when 'creative-studio' then 'Creative Studio'
    when 'life-skills' then 'Life Skills Village'
    else p_key end
$$;

-- A family-friendly learning summary built only from saved records.
create or replace function app.child_summary(p_student uuid, p_include_private boolean default false) returns jsonb
language sql stable set search_path = app as $$
  select jsonb_build_object(
    'id', s.id,
    'first_name', s.first_name,
    'last_name', s.last_name,
    'nickname', s.nickname,
    'level', s.level,
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name,
        'teachers', coalesce((select jsonb_agg(jsonb_build_object('name', t.full_name, 'email', t.email))
                                from app.class_teachers ct join app.teachers t on t.id = ct.teacher_id
                               where ct.class_id = c.id), '[]'::jsonb)))
       from app.class_students cs join app.classes c on c.id = cs.class_id where cs.student_id = s.id), '[]'::jsonb),
    'week_count', (select count(*) from app.activity_attempts where student_id = s.id and completed_at > now() - interval '7 days'),
    'week_areas', coalesce((select jsonb_agg(distinct app.area_name(activity_key)) from app.activity_attempts
                     where student_id = s.id and completed_at > now() - interval '7 days'), '[]'::jsonb),
    'total_attempts', (select count(*) from app.activity_attempts where student_id = s.id),
    'total_stars', coalesce((select sum(best_stars) from app.student_progress where student_id = s.id), 0),
    'progress', coalesce((select jsonb_agg(jsonb_build_object('area', p.activity_key, 'area_name', app.area_name(p.activity_key),
        'completions', p.completions, 'best_score_pct', p.best_score_pct, 'best_stars', p.best_stars, 'last_played_at', p.last_played_at)
        order by p.last_played_at desc) from app.student_progress p where p.student_id = s.id), '[]'::jsonb),
    'area_averages', coalesce((select jsonb_agg(jsonb_build_object('area', x.k, 'area_name', app.area_name(x.k), 'avg_pct', x.avg_pct, 'attempts', x.n))
        from (select activity_key k, round(avg(score * 100.0 / max_score))::int avg_pct, count(*) n
                from app.activity_attempts where student_id = s.id group by activity_key) x), '[]'::jsonb),
    'recent_attempts', coalesce((select jsonb_agg(r order by r->>'completed_at' desc) from (
        select jsonb_build_object('id', a.id, 'area', a.activity_key, 'area_name', app.area_name(a.activity_key),
          'lesson_title', l.title, 'score', a.score, 'max_score', a.max_score, 'stars', a.stars,
          'mistakes', a.mistakes, 'completed_at', a.completed_at, 'feedback', ar.feedback) r
          from app.activity_attempts a
          left join app.lessons l on l.id = a.lesson_id
          left join app.assessment_results ar on ar.attempt_id = a.id
         where a.student_id = s.id order by a.completed_at desc limit 15) q), '[]'::jsonb),
    'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'title', l.title, 'area', l.location,
        'area_name', app.area_name(l.location), 'due_at', a.due_at, 'note', a.note,
        'completed', exists(select 1 from app.activity_attempts x where x.assignment_id = a.id and x.student_id = s.id),
        'best_stars', (select max(stars) from app.activity_attempts x where x.assignment_id = a.id and x.student_id = s.id))
        order by a.due_at nulls last)
        from app.student_assignments(s.id) a join app.lessons l on l.id = a.lesson_id), '[]'::jsonb),
    'attendance', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'status', status, 'note', note) order by day desc)
        from (select * from app.attendance_records where student_id = s.id order by day desc limit 10) ar), '[]'::jsonb),
    'observations', coalesce((select jsonb_agg(jsonb_build_object('note', o.note, 'teacher', t.full_name, 'created_at', o.created_at, 'shared', o.share_with_family) order by o.created_at desc)
        from app.observations o left join app.teachers t on t.id = o.teacher_id
       where o.student_id = s.id and (p_include_private or o.share_with_family)), '[]'::jsonb),
    'achievements', coalesce((select jsonb_agg(jsonb_build_object('key', ac.key, 'title', ac.title, 'icon', ac.icon, 'earned_at', sa.earned_at))
        from app.student_achievements sa join app.achievements ac on ac.key = sa.achievement_key where sa.student_id = s.id), '[]'::jsonb)
  )
  from app.students s where s.id = p_student
$$;
