-- Public API: authentication and the student playground.
-- Every function is SECURITY DEFINER, pins search_path, and derives the caller
-- from the session token. Role values from the browser are never trusted.

create or replace function public.api_login(p_kind text, p_identifier text, p_password text, p_client text)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare
  v_ident text;
  v_acc app.accounts;
  v_token text;
  v_ok boolean := false;
  v_client text := left(coalesce(p_client, 'unknown'), 80);
begin
  if p_kind not in ('student', 'adult') or p_identifier is null or p_password is null
     or length(p_password) > 200 or length(p_identifier) > 200 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  v_ident := case when p_kind = 'student'
                  then upper(regexp_replace(p_identifier, '[\s-]', '', 'g'))
                  else lower(trim(p_identifier)) end;

  if (select count(*) from app.login_attempts where identifier = v_ident and attempted_at > now() - interval '15 minutes') >= 5
     or (select count(*) from app.login_attempts where client_key = v_client and attempted_at > now() - interval '15 minutes') >= 30 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if p_kind = 'student' then
    select * into v_acc from app.accounts where role = 'student' and student_code = v_ident;
  else
    select * into v_acc from app.accounts where role <> 'student' and email = v_ident::extensions.citext;
  end if;

  if v_acc.id is not null then
    v_ok := extensions.crypt(p_password, v_acc.password_hash) = v_acc.password_hash and v_acc.status = 'active';
  else
    -- Spend comparable time so response timing does not reveal whether an account exists.
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 10));
  end if;

  if not v_ok then
    insert into app.login_attempts(identifier, client_key) values (v_ident, v_client);
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  delete from app.login_attempts where identifier = v_ident;
  delete from app.login_attempts where attempted_at < now() - interval '1 day';
  delete from app.sessions where expires_at < now();

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into app.sessions(token_hash, account_id, expires_at)
  values (app.hash_token(v_token), v_acc.id, now() + interval '12 hours');
  update app.accounts set last_login_at = now() where id = v_acc.id;

  return jsonb_build_object('ok', true, 'token', v_token, 'role', v_acc.role);
end $$;

create or replace function public.api_logout(p_token text) returns void
language sql security definer set search_path = app, extensions as $$
  delete from app.sessions where token_hash = app.hash_token(p_token);
$$;

create or replace function public.api_me(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_student app.students;
begin
  v := app.try_actor(p_token);
  if v.id is null then return null; end if;
  if v.role = 'student' then
    select * into v_student from app.students where account_id = v.id;
  end if;
  return jsonb_build_object(
    'account_id', v.id, 'role', v.role, 'display_name', v.display_name,
    'email', v.email, 'is_demo', v.is_demo, 'is_protected', v.is_protected,
    'student', case when v_student.id is null then null else jsonb_build_object(
      'id', v_student.id, 'first_name', v_student.first_name, 'nickname', v_student.nickname, 'level', v_student.level) end,
    'sound_enabled', coalesce((select sound_enabled from app.profiles where account_id = v.id), true));
end $$;

create or replace function public.api_change_password(p_token text, p_current text, p_new text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['student','parent','teacher','admin','admissions']);
  if v.is_protected then
    return jsonb_build_object('ok', false, 'error', 'demo_restricted');
  end if;
  if extensions.crypt(p_current, v.password_hash) <> v.password_hash then
    return jsonb_build_object('ok', false, 'error', 'invalid_current');
  end if;
  if length(p_new) < 10 or length(p_new) > 128 then
    return jsonb_build_object('ok', false, 'error', 'weak');
  end if;
  update app.accounts set password_hash = app.hash_password(p_new), password_changed_at = now(), updated_at = now() where id = v.id;
  delete from app.sessions where account_id = v.id and token_hash <> app.hash_token(p_token);
  perform app.audit(v, 'account.password_changed', 'account', v.id::text);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_set_sound(p_token text, p_enabled boolean) returns void
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['student','parent','teacher','admin','admissions']);
  insert into app.profiles(account_id, sound_enabled) values (v.id, p_enabled)
  on conflict (account_id) do update set sound_enabled = excluded.sound_enabled, updated_at = now();
end $$;

-- ---------------------------------------------------------------------------
-- Student
-- ---------------------------------------------------------------------------
create or replace function app.student_for(p_actor app.accounts) returns app.students
language plpgsql stable set search_path = app as $$
declare s app.students;
begin
  select * into s from app.students where account_id = p_actor.id;
  if s.id is null then raise exception 'forbidden' using errcode = '42501'; end if;
  return s;
end $$;

create or replace function public.api_student_home(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; s app.students; v_goal int;
begin
  v := app.require_role(p_token, array['student']);
  s := app.student_for(v);
  select daily_goal into v_goal from app.school_settings where id = 1;
  return jsonb_build_object(
    'student', jsonb_build_object('id', s.id, 'first_name', s.first_name, 'nickname', s.nickname, 'level', s.level),
    'daily_goal', coalesce(v_goal, 3),
    'today_count', (select count(*) from app.activity_attempts where student_id = s.id and completed_at::date = now()::date),
    'total_stars', coalesce((select sum(best_stars) from app.student_progress where student_id = s.id), 0),
    'progress', coalesce((select jsonb_object_agg(activity_key, jsonb_build_object('completions', completions,
        'best_stars', best_stars, 'best_score_pct', best_score_pct)) from app.student_progress where student_id = s.id), '{}'::jsonb),
    'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'title', l.title, 'area', l.location,
        'activity_type', l.activity_type, 'due_at', a.due_at,
        'completed', exists(select 1 from app.activity_attempts x where x.assignment_id = a.id and x.student_id = s.id))
        order by a.created_at desc)
        from app.student_assignments(s.id) a join app.lessons l on l.id = a.lesson_id where l.status = 'published'), '[]'::jsonb),
    'achievements', coalesce((select jsonb_agg(jsonb_build_object('key', ac.key, 'title', ac.title, 'description', ac.description,
        'icon', ac.icon, 'earned', sa.student_id is not null) order by ac.key)
        from app.achievements ac left join app.student_achievements sa on sa.achievement_key = ac.key and sa.student_id = s.id), '[]'::jsonb),
    'feedback', coalesce((select jsonb_agg(jsonb_build_object('feedback', ar.feedback, 'area', app.area_name(a.activity_key), 'at', ar.created_at)
        order by ar.created_at desc) from app.assessment_results ar join app.activity_attempts a on a.id = ar.attempt_id
        where a.student_id = s.id), '[]'::jsonb)
  );
end $$;

create or replace function public.api_student_assignment(p_token text, p_assignment uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; s app.students; r record;
begin
  v := app.require_role(p_token, array['student']);
  s := app.student_for(v);
  select a.id, a.due_at, a.note, l.* into r
    from app.student_assignments(s.id) a join app.lessons l on l.id = a.lesson_id
   where a.id = p_assignment and l.status = 'published';
  if not found then raise exception 'forbidden' using errcode = '42501'; end if;
  return jsonb_build_object('assignment_id', p_assignment, 'due_at', r.due_at, 'note', r.note,
    'lesson', jsonb_build_object('id', r.id, 'title', r.title, 'description', r.description, 'instructions', r.instructions,
      'activity_type', r.activity_type, 'location', r.location, 'questions', r.questions, 'media_url', r.media_url));
end $$;

create or replace function app.award_achievements(p_student uuid) returns jsonb
language plpgsql set search_path = app as $$
declare v_new jsonb := '[]'::jsonb; k text; v_total int; v_areas int;
begin
  select coalesce(sum(best_stars), 0), count(*) into v_total, v_areas from app.student_progress where student_id = p_student and completions > 0;
  for k in
    select key from app.achievements ac where not exists (select 1 from app.student_achievements where student_id = p_student and achievement_key = ac.key)
  loop
    if (k = 'first-star' and v_areas >= 1)
       or (k = 'abc-explorer' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'abc-garden' and best_stars = 3))
       or (k = 'counting-champ' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'number-playground' and best_stars = 3))
       or (k = 'shape-spotter' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'shapes-colours' and best_stars = 3))
       or (k = 'animal-friend' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'animal-world'))
       or (k = 'story-lover' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'storytime'))
       or (k = 'little-artist' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'creative-studio'))
       or (k = 'kind-helper' and exists(select 1 from app.student_progress where student_id = p_student and activity_key = 'life-skills'))
       or (k = 'adventurer' and v_areas >= 4)
       or (k = 'star-collector' and v_total >= 10)
       or (k = 'homework-hero' and exists(select 1 from app.activity_attempts where student_id = p_student and assignment_id is not null))
    then
      insert into app.student_achievements(student_id, achievement_key) values (p_student, k) on conflict do nothing;
      v_new := v_new || (select jsonb_build_object('key', key, 'title', title, 'icon', icon) from app.achievements where key = k);
    end if;
  end loop;
  return v_new;
end $$;

-- Saves a finished activity. For teacher lessons the score is computed here from
-- the submitted answers, so the browser cannot award itself a perfect score.
create or replace function public.api_record_attempt(
  p_token text, p_area text, p_assignment uuid, p_score int, p_max int,
  p_answers jsonb, p_mistakes jsonb, p_duration int)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare
  v app.accounts; s app.students; l app.lessons;
  v_score int := p_score; v_max int := p_max; v_area text := p_area;
  v_mistakes jsonb := coalesce(p_mistakes, '[]'::jsonb);
  v_answers jsonb := coalesce(p_answers, '[]'::jsonb);
  v_stars int; v_id uuid; v_pct int; q jsonb; i int; v_given text; v_expected text;
begin
  v := app.require_role(p_token, array['student']);
  s := app.student_for(v);

  if jsonb_typeof(v_answers) <> 'array' or jsonb_typeof(v_mistakes) <> 'array'
     or jsonb_array_length(v_answers) > 100 or jsonb_array_length(v_mistakes) > 100 then
    raise exception 'invalid_payload' using errcode = '22023';
  end if;

  if p_assignment is not null then
    select l2.* into l from app.student_assignments(s.id) a join app.lessons l2 on l2.id = a.lesson_id
     where a.id = p_assignment and l2.status = 'published';
    if l.id is null then raise exception 'forbidden' using errcode = '42501'; end if;
    v_area := l.location;
    v_max := greatest(jsonb_array_length(l.questions), 1) * l.points_per_question;
    v_score := 0;
    v_mistakes := '[]'::jsonb;
    for i in 0 .. jsonb_array_length(l.questions) - 1 loop
      q := l.questions -> i;
      v_given := lower(trim(coalesce(v_answers ->> i, '')));
      v_expected := lower(trim(coalesce(q ->> 'answer', q ->> 'target', '')));
      if v_given = v_expected and v_expected <> '' then
        v_score := v_score + l.points_per_question;
      else
        v_mistakes := v_mistakes || to_jsonb(coalesce(q ->> 'prompt', 'Question ' || (i + 1)));
      end if;
    end loop;
  else
    if v_area not in ('abc-garden','number-playground','animal-world','storytime','shapes-colours','creative-studio','life-skills') then
      raise exception 'invalid_area' using errcode = '22023';
    end if;
    if v_max is null or v_max < 1 or v_max > 50 or v_score is null or v_score < 0 or v_score > v_max then
      raise exception 'invalid_score' using errcode = '22023';
    end if;
  end if;

  v_stars := app.stars_for(v_score, v_max);
  v_pct := round(v_score * 100.0 / v_max);
  insert into app.activity_attempts(student_id, activity_key, assignment_id, lesson_id, score, max_score, stars, answers, mistakes, duration_seconds)
  values (s.id, v_area, p_assignment, l.id, v_score, v_max, v_stars, v_answers, v_mistakes, least(greatest(coalesce(p_duration, 0), 0), 7200))
  returning id into v_id;

  insert into app.student_progress(student_id, activity_key, completions, best_score_pct, best_stars, last_played_at)
  values (s.id, v_area, 1, v_pct, v_stars, now())
  on conflict (student_id, activity_key) do update set
    completions = app.student_progress.completions + 1,
    best_score_pct = greatest(app.student_progress.best_score_pct, excluded.best_score_pct),
    best_stars = greatest(app.student_progress.best_stars, excluded.best_stars),
    last_played_at = now();

  return jsonb_build_object('attempt_id', v_id, 'score', v_score, 'max_score', v_max, 'stars', v_stars,
    'mistakes', v_mistakes, 'new_achievements', app.award_achievements(s.id),
    'total_stars', (select coalesce(sum(best_stars), 0) from app.student_progress where student_id = s.id));
end $$;
