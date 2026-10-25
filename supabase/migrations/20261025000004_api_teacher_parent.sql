-- Public API: teacher and parent portals.

create or replace function app.require_teacher(p_token text, out v app.accounts, out t uuid)
language plpgsql set search_path = app as $$
begin
  v := app.require_role(p_token, array['teacher']);
  t := app.teacher_id_for(v);
  if t is null then raise exception 'forbidden' using errcode = '42501'; end if;
end $$;

create or replace function app.student_stats(p_student uuid) returns jsonb
language sql stable set search_path = app as $$
  select jsonb_build_object(
    'attempts', count(*),
    'avg_pct', coalesce(round(avg(score * 100.0 / max_score))::int, null),
    'recent_avg_pct', (select round(avg(x.score * 100.0 / x.max_score))::int from
        (select score, max_score from app.activity_attempts where student_id = p_student order by completed_at desc limit 5) x),
    'last_at', max(completed_at),
    'stars', coalesce((select sum(best_stars) from app.student_progress where student_id = p_student), 0))
  from app.activity_attempts where student_id = p_student
$$;

create or replace function public.api_teacher_overview(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record; v_students uuid[];
begin
  select * into r from app.require_teacher(p_token);
  select coalesce(array_agg(distinct cs.student_id), '{}') into v_students
    from app.class_teachers ct join app.class_students cs on cs.class_id = ct.class_id where ct.teacher_id = r.t;

  return jsonb_build_object(
    'teacher', (select jsonb_build_object('name', full_name, 'email', email) from app.teachers where id = r.t),
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'level', c.level, 'school_year', c.school_year,
        'student_count', (select count(*) from app.class_students where class_id = c.id)) order by c.name)
        from app.classes c join app.class_teachers ct on ct.class_id = c.id where ct.teacher_id = r.t), '[]'::jsonb),
    'total_students', coalesce(array_length(v_students, 1), 0),
    'recent_activity', coalesce((select jsonb_agg(x order by x->>'completed_at' desc) from (
        select jsonb_build_object('attempt_id', a.id, 'student_id', s.id, 'student', s.first_name || ' ' || s.last_name,
          'area_name', app.area_name(a.activity_key), 'lesson_title', l.title, 'score', a.score, 'max_score', a.max_score,
          'stars', a.stars, 'completed_at', a.completed_at, 'feedback', ar.feedback) x
          from app.activity_attempts a join app.students s on s.id = a.student_id
          left join app.lessons l on l.id = a.lesson_id left join app.assessment_results ar on ar.attempt_id = a.id
         where a.student_id = any(v_students) order by a.completed_at desc limit 10) q), '[]'::jsonb),
    'assignments', coalesce((select jsonb_agg(z order by z->>'due_at' nulls last) from (
        select jsonb_build_object('id', a.id, 'title', l.title, 'area_name', app.area_name(l.location), 'due_at', a.due_at,
          'target', coalesce(c.name, st.first_name || ' ' || st.last_name),
          'assigned', case when a.class_id is not null then (select count(*) from app.class_students where class_id = a.class_id) else 1 end,
          'completed', (select count(distinct x.student_id) from app.activity_attempts x where x.assignment_id = a.id)) z
          from app.assignments a join app.lessons l on l.id = a.lesson_id
          left join app.classes c on c.id = a.class_id left join app.students st on st.id = a.student_id
         where (a.class_id in (select class_id from app.class_teachers where teacher_id = r.t))
            or (a.student_id = any(v_students))) q), '[]'::jsonb),
    'needs_support', coalesce((select jsonb_agg(jsonb_build_object('student_id', s.id, 'name', s.first_name || ' ' || s.last_name,
          'stats', app.student_stats(s.id),
          'reason', case when not exists(select 1 from app.activity_attempts where student_id = s.id and completed_at > now() - interval '7 days')
                         then 'No activities this week' else 'Recent scores below 60%' end))
        from app.students s where s.id = any(v_students) and (
          not exists(select 1 from app.activity_attempts where student_id = s.id and completed_at > now() - interval '7 days')
          or (select avg(x.score * 100.0 / x.max_score) from (select score, max_score from app.activity_attempts
                where student_id = s.id order by completed_at desc limit 5) x) < 60)), '[]'::jsonb),
    'lesson_count', (select count(*) from app.lessons where created_by = r.t)
  );
end $$;

create or replace function public.api_teacher_class(p_token text, p_class uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record;
begin
  select * into r from app.require_teacher(p_token);
  if not app.teacher_has_class(r.t, p_class) then raise exception 'forbidden' using errcode = '42501'; end if;
  return (select jsonb_build_object('id', c.id, 'name', c.name, 'level', c.level, 'school_year', c.school_year,
    'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'first_name', s.first_name, 'last_name', s.last_name,
        'nickname', s.nickname, 'stats', app.student_stats(s.id),
        'attendance_today', (select status from app.attendance_records where student_id = s.id and class_id = c.id and day = current_date))
        order by s.first_name) from app.class_students cs join app.students s on s.id = cs.student_id where cs.class_id = c.id), '[]'::jsonb))
    from app.classes c where c.id = p_class);
end $$;

create or replace function public.api_teacher_students(p_token text, p_search text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record; v_q text := '%' || coalesce(trim(p_search), '') || '%';
begin
  select * into r from app.require_teacher(p_token);
  return coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'first_name', s.first_name, 'last_name', s.last_name,
      'level', s.level, 'class', c.name, 'class_id', c.id, 'stats', app.student_stats(s.id)) order by s.first_name)
    from app.class_teachers ct join app.class_students cs on cs.class_id = ct.class_id
    join app.students s on s.id = cs.student_id join app.classes c on c.id = ct.class_id
    where ct.teacher_id = r.t and (s.first_name || ' ' || s.last_name || ' ' || coalesce(s.nickname, '')) ilike v_q), '[]'::jsonb);
end $$;

create or replace function public.api_teacher_student(p_token text, p_student uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record;
begin
  select * into r from app.require_teacher(p_token);
  if not app.teacher_has_student(r.t, p_student) then raise exception 'forbidden' using errcode = '42501'; end if;
  return app.child_summary(p_student, true) || jsonb_build_object(
    'stats', app.student_stats(p_student),
    'guardians', coalesce((select jsonb_agg(jsonb_build_object('name', g.full_name, 'email', g.email, 'phone', g.phone, 'relationship', sg.relationship))
       from app.student_guardians sg join app.guardians g on g.id = sg.guardian_id where sg.student_id = p_student), '[]'::jsonb));
end $$;

create or replace function public.api_lessons(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; t uuid;
begin
  v := app.require_role(p_token, array['teacher','admin']);
  t := app.teacher_id_for(v);
  return coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'title', l.title, 'subject', sj.name, 'subject_slug', sj.slug,
      'level', l.level, 'activity_type', l.activity_type, 'location', l.location, 'area_name', app.area_name(l.location),
      'status', l.status, 'question_count', jsonb_array_length(l.questions), 'mine', l.created_by = t,
      'author', tt.full_name, 'updated_at', l.updated_at,
      'assignment_count', (select count(*) from app.assignments where lesson_id = l.id)) order by l.updated_at desc)
    from app.lessons l join app.subjects sj on sj.id = l.subject_id left join app.teachers tt on tt.id = l.created_by
    where app.visible(v, l.is_demo) and (v.role = 'admin' or l.created_by = t or l.status = 'published')), '[]'::jsonb);
end $$;

create or replace function public.api_get_lesson(p_token text, p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; t uuid; l app.lessons;
begin
  v := app.require_role(p_token, array['teacher','admin']);
  t := app.teacher_id_for(v);
  select * into l from app.lessons where id = p_lesson;
  if l.id is null or not app.visible(v, l.is_demo) or (v.role = 'teacher' and l.created_by is distinct from t and l.status <> 'published') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return to_jsonb(l) || jsonb_build_object('subject_slug', (select slug from app.subjects where id = l.subject_id),
    'mine', l.created_by = t, 'area_name', app.area_name(l.location));
end $$;

create or replace function public.api_subjects() returns jsonb
language sql security definer set search_path = app as $$
  select coalesce(jsonb_agg(jsonb_build_object('slug', slug, 'name', name) order by name), '[]'::jsonb) from app.subjects
$$;

create or replace function public.api_save_lesson(p_token text, p_lesson jsonb) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; t uuid; v_id uuid := nullif(p_lesson->>'id', '')::uuid; v_existing app.lessons; v_subject uuid;
begin
  v := app.require_role(p_token, array['teacher','admin']);
  t := app.teacher_id_for(v);
  select id into v_subject from app.subjects where slug = p_lesson->>'subject';
  if v_subject is null then raise exception 'invalid_subject' using errcode = '22023'; end if;
  if jsonb_typeof(p_lesson->'questions') <> 'array' or jsonb_array_length(p_lesson->'questions') not between 1 and 20 then
    raise exception 'invalid_questions' using errcode = '22023';
  end if;

  if v_id is not null then
    select * into v_existing from app.lessons where id = v_id for update;
    if v_existing.id is null or not app.visible(v, v_existing.is_demo)
       or (v.role = 'teacher' and v_existing.created_by is distinct from t) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    update app.lessons set
      title = p_lesson->>'title', subject_id = v_subject, level = p_lesson->>'level',
      description = coalesce(p_lesson->>'description', ''),
      objectives = coalesce((select array_agg(x) from jsonb_array_elements_text(p_lesson->'objectives') x), '{}'),
      instructions = coalesce(p_lesson->>'instructions', ''), activity_type = p_lesson->>'activity_type',
      location = p_lesson->>'location', media_url = nullif(p_lesson->>'media_url', ''), questions = p_lesson->'questions',
      pass_mark = coalesce((p_lesson->>'pass_mark')::int, 60), points_per_question = coalesce((p_lesson->>'points_per_question')::int, 1),
      status = p_lesson->>'status', updated_at = now()
    where id = v_id;
    perform app.audit(v, 'lesson.updated', 'lesson', v_id::text, jsonb_build_object('title', p_lesson->>'title', 'status', p_lesson->>'status'));
  else
    insert into app.lessons(title, subject_id, level, description, objectives, instructions, activity_type, location, media_url,
                            questions, pass_mark, points_per_question, status, created_by, is_demo)
    values (p_lesson->>'title', v_subject, p_lesson->>'level', coalesce(p_lesson->>'description', ''),
      coalesce((select array_agg(x) from jsonb_array_elements_text(p_lesson->'objectives') x), '{}'),
      coalesce(p_lesson->>'instructions', ''), p_lesson->>'activity_type', p_lesson->>'location', nullif(p_lesson->>'media_url', ''),
      p_lesson->'questions', coalesce((p_lesson->>'pass_mark')::int, 60), coalesce((p_lesson->>'points_per_question')::int, 1),
      p_lesson->>'status', t, coalesce((select demo_mode from app.school_settings where id = 1), true))
    returning id into v_id;
    perform app.audit(v, 'lesson.created', 'lesson', v_id::text, jsonb_build_object('title', p_lesson->>'title'));
  end if;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function public.api_create_assignment(p_token text, p_lesson uuid, p_class uuid, p_student uuid, p_due timestamptz, p_note text)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare r record; v_id uuid; l app.lessons;
begin
  select * into r from app.require_teacher(p_token);
  select * into l from app.lessons where id = p_lesson;
  if l.id is null or l.status <> 'published' then raise exception 'lesson_not_published' using errcode = '22023'; end if;
  if (p_class is null) = (p_student is null) then raise exception 'invalid_target' using errcode = '22023'; end if;
  if p_class is not null and not app.teacher_has_class(r.t, p_class) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_student is not null and not app.teacher_has_student(r.t, p_student) then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into app.assignments(lesson_id, class_id, student_id, assigned_by, due_at, note)
  values (p_lesson, p_class, p_student, r.t, p_due, nullif(left(trim(coalesce(p_note, '')), 500), ''))
  returning id into v_id;
  perform app.audit(r.v, 'assignment.created', 'assignment', v_id::text, jsonb_build_object('lesson', l.title, 'class', p_class, 'student', p_student));
  return jsonb_build_object('id', v_id);
end $$;

create or replace function public.api_teacher_assignments(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record;
begin
  select * into r from app.require_teacher(p_token);
  return (public.api_teacher_overview(p_token))->'assignments';
end $$;

create or replace function public.api_assignment_detail(p_token text, p_assignment uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record; a app.assignments; v_students uuid[];
begin
  select * into r from app.require_teacher(p_token);
  select * into a from app.assignments where id = p_assignment;
  if a.id is null or (a.class_id is not null and not app.teacher_has_class(r.t, a.class_id))
     or (a.student_id is not null and not app.teacher_has_student(r.t, a.student_id)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if a.class_id is not null then
    select array_agg(student_id) into v_students from app.class_students where class_id = a.class_id;
  else
    v_students := array[a.student_id];
  end if;
  return jsonb_build_object(
    'id', a.id, 'due_at', a.due_at, 'note', a.note, 'class_id', a.class_id,
    'lesson', (select jsonb_build_object('id', l.id, 'title', l.title, 'area_name', app.area_name(l.location), 'activity_type', l.activity_type,
        'questions', jsonb_array_length(l.questions)) from app.lessons l where l.id = a.lesson_id),
    'submissions', coalesce((select jsonb_agg(jsonb_build_object('student_id', s.id, 'name', s.first_name || ' ' || s.last_name,
        'attempt', (select jsonb_build_object('id', x.id, 'score', x.score, 'max_score', x.max_score, 'stars', x.stars,
            'mistakes', x.mistakes, 'completed_at', x.completed_at,
            'feedback', (select feedback from app.assessment_results where attempt_id = x.id))
          from app.activity_attempts x where x.assignment_id = a.id and x.student_id = s.id order by x.completed_at desc limit 1)) order by s.first_name)
       from app.students s where s.id = any(v_students)), '[]'::jsonb),
    'common_mistakes', coalesce((select jsonb_agg(jsonb_build_object('prompt', m, 'count', n) order by n desc) from (
        select m, count(*) n from app.activity_attempts x, jsonb_array_elements_text(x.mistakes) m
         where x.assignment_id = a.id group by m order by count(*) desc limit 8) q), '[]'::jsonb));
end $$;

create or replace function public.api_teacher_results(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record; v_students uuid[];
begin
  select * into r from app.require_teacher(p_token);
  select coalesce(array_agg(distinct cs.student_id), '{}') into v_students
    from app.class_teachers ct join app.class_students cs on cs.class_id = ct.class_id where ct.teacher_id = r.t;
  return jsonb_build_object(
    'results', coalesce((select jsonb_agg(x order by x->>'completed_at' desc) from (
      select jsonb_build_object('attempt_id', a.id, 'student_id', s.id, 'student', s.first_name || ' ' || s.last_name,
        'area_name', app.area_name(a.activity_key), 'lesson_title', l.title, 'score', a.score, 'max_score', a.max_score,
        'stars', a.stars, 'mistakes', a.mistakes, 'completed_at', a.completed_at, 'feedback', ar.feedback) x
        from app.activity_attempts a join app.students s on s.id = a.student_id
        left join app.lessons l on l.id = a.lesson_id left join app.assessment_results ar on ar.attempt_id = a.id
       where a.student_id = any(v_students) order by a.completed_at desc limit 60) q), '[]'::jsonb),
    'common_mistakes', coalesce((select jsonb_agg(jsonb_build_object('prompt', m, 'area_name', app.area_name(k), 'count', n) order by n desc) from (
        select m, x.activity_key k, count(*) n from app.activity_attempts x, jsonb_array_elements_text(x.mistakes) m
         where x.student_id = any(v_students) group by m, x.activity_key order by count(*) desc limit 10) q), '[]'::jsonb));
end $$;

create or replace function public.api_give_feedback(p_token text, p_attempt uuid, p_feedback text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare r record; v_student uuid;
begin
  select * into r from app.require_teacher(p_token);
  select student_id into v_student from app.activity_attempts where id = p_attempt;
  if v_student is null or not app.teacher_has_student(r.t, v_student) then raise exception 'forbidden' using errcode = '42501'; end if;
  if length(trim(coalesce(p_feedback, ''))) not between 2 and 1000 then raise exception 'invalid_feedback' using errcode = '22023'; end if;
  insert into app.assessment_results(attempt_id, teacher_id, feedback) values (p_attempt, r.t, trim(p_feedback))
  on conflict (attempt_id) do update set feedback = excluded.feedback, teacher_id = excluded.teacher_id, updated_at = now();
  perform app.audit(r.v, 'feedback.saved', 'attempt', p_attempt::text);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_record_attendance(p_token text, p_class uuid, p_student uuid, p_status text, p_note text)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare r record;
begin
  select * into r from app.require_teacher(p_token);
  if not app.teacher_has_class(r.t, p_class) or not exists(select 1 from app.class_students where class_id = p_class and student_id = p_student) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into app.attendance_records(student_id, class_id, day, status, note, recorded_by)
  values (p_student, p_class, current_date, p_status, nullif(left(trim(coalesce(p_note, '')), 300), ''), r.t)
  on conflict (student_id, class_id, day) do update set status = excluded.status, note = excluded.note, recorded_by = excluded.recorded_by;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_add_observation(p_token text, p_student uuid, p_note text, p_share boolean)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare r record;
begin
  select * into r from app.require_teacher(p_token);
  if not app.teacher_has_student(r.t, p_student) then raise exception 'forbidden' using errcode = '42501'; end if;
  if length(trim(coalesce(p_note, ''))) not between 2 and 1000 then raise exception 'invalid_note' using errcode = '22023'; end if;
  insert into app.observations(student_id, teacher_id, note, share_with_family) values (p_student, r.t, trim(p_note), coalesce(p_share, true));
  return jsonb_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------------------
-- Parent
-- ---------------------------------------------------------------------------
create or replace function app.guardian_for(p_actor app.accounts) returns uuid
language plpgsql stable set search_path = app as $$
declare g uuid;
begin
  select id into g from app.guardians where account_id = p_actor.id;
  if g is null then raise exception 'forbidden' using errcode = '42501'; end if;
  return g;
end $$;

create or replace function public.api_parent_overview(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; g uuid;
begin
  v := app.require_role(p_token, array['parent']);
  g := app.guardian_for(v);
  return jsonb_build_object(
    'guardian', (select jsonb_build_object('name', full_name, 'email', email, 'phone', phone) from app.guardians where id = g),
    'children', coalesce((select jsonb_agg(app.child_summary(sg.student_id) order by s.first_name)
        from app.student_guardians sg join app.students s on s.id = sg.student_id where sg.guardian_id = g), '[]'::jsonb),
    'announcements', coalesce((select jsonb_agg(jsonb_build_object('title', an.title, 'body', an.body, 'published_at', an.published_at)
        order by an.published_at desc) from app.announcements an
        where an.audience in ('families','all') and app.visible(v, an.is_demo)
          and (an.class_id is null or an.class_id in (select cs.class_id from app.class_students cs
                 join app.student_guardians sg on sg.student_id = cs.student_id where sg.guardian_id = g))), '[]'::jsonb),
    'school', (select jsonb_build_object('name', school_name, 'contact_email', contact_email) from app.school_settings where id = 1));
end $$;

create or replace function public.api_parent_child(p_token text, p_student uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; g uuid;
begin
  v := app.require_role(p_token, array['parent']);
  g := app.guardian_for(v);
  if not exists(select 1 from app.student_guardians where guardian_id = g and student_id = p_student) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return app.child_summary(p_student);
end $$;

create or replace function public.api_parent_update_phone(p_token text, p_phone text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; g uuid;
begin
  v := app.require_role(p_token, array['parent']);
  g := app.guardian_for(v);
  if p_phone !~ '^[0-9+()\s-]{6,24}$' then raise exception 'invalid_phone' using errcode = '22023'; end if;
  update app.guardians set phone = trim(p_phone) where id = g;
  perform app.audit(v, 'guardian.phone_updated', 'guardian', g::text);
  return jsonb_build_object('ok', true);
end $$;
