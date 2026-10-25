-- Public API: admissions and administration.

create or replace function app.rate_limited(p_key text, p_limit int, p_window interval) returns boolean
language plpgsql set search_path = app as $$
begin
  if (select count(*) from app.login_attempts where client_key = p_key and attempted_at > now() - p_window) >= p_limit then
    return true;
  end if;
  insert into app.login_attempts(identifier, client_key) values ('action', p_key);
  return false;
end $$;

create or replace function public.api_submit_application(p_app jsonb, p_documents jsonb, p_client text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v_ref text; v_id uuid; d jsonb; v_bytes bytea; v_demo boolean;
begin
  if app.rate_limited('apply:' || left(coalesce(p_client, 'unknown'), 80), 5, interval '1 hour') then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  if coalesce((p_app->>'consent_data')::boolean, false) is not true or coalesce((p_app->>'consent_terms')::boolean, false) is not true then
    return jsonb_build_object('ok', false, 'error', 'consent_required');
  end if;
  if coalesce(jsonb_array_length(p_documents), 0) > 3 then
    return jsonb_build_object('ok', false, 'error', 'too_many_documents');
  end if;
  select demo_mode into v_demo from app.school_settings where id = 1;
  v_ref := 'KZ-' || to_char(now(), 'YYYY') || '-' || substr(app.new_student_code(), 1, 6);
  insert into app.admission_applications(reference, child_first_name, child_last_name, child_date_of_birth, requested_level,
      guardian_name, guardian_email, guardian_phone, emergency_contact_name, emergency_contact_phone, notes_from_family,
      consent_data, consent_terms, status, is_demo)
  values (v_ref, trim(p_app->>'child_first_name'), trim(p_app->>'child_last_name'), (p_app->>'child_date_of_birth')::date,
      p_app->>'requested_level', trim(p_app->>'guardian_name'), lower(trim(p_app->>'guardian_email')), trim(p_app->>'guardian_phone'),
      nullif(trim(p_app->>'emergency_contact_name'), ''), nullif(trim(p_app->>'emergency_contact_phone'), ''),
      nullif(left(trim(coalesce(p_app->>'notes_from_family', '')), 1000), ''), true, true, 'submitted', coalesce(v_demo, true))
  returning id into v_id;
  for d in select * from jsonb_array_elements(coalesce(p_documents, '[]'::jsonb)) loop
    v_bytes := decode(d->>'data_base64', 'base64');
    insert into app.application_documents(application_id, file_name, mime_type, size_bytes, content)
    values (v_id, left(regexp_replace(d->>'file_name', '[^A-Za-z0-9._ -]', '_', 'g'), 120), d->>'mime_type', length(v_bytes), v_bytes);
  end loop;
  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;

create or replace function public.api_application_status(p_reference text, p_email text, p_client text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare a app.admission_applications;
begin
  if app.rate_limited('status:' || left(coalesce(p_client, 'unknown'), 80), 20, interval '15 minutes') then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  select * into a from app.admission_applications
   where reference = upper(trim(p_reference)) and guardian_email = lower(trim(p_email))::extensions.citext;
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  return jsonb_build_object('ok', true, 'reference', a.reference, 'status', a.status, 'child_first_name', a.child_first_name,
    'requested_level', a.requested_level, 'submitted_at', a.submitted_at, 'updated_at', a.updated_at,
    'message', case when a.status = 'information_required' then a.decision_note else null end);
end $$;

create or replace function public.api_admissions_list(p_token text, p_search text, p_status text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_q text := '%' || coalesce(trim(p_search), '') || '%';
begin
  v := app.require_role(p_token, array['admissions','admin']);
  return jsonb_build_object(
    'counts', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) n from app.admission_applications
        where app.visible(v, is_demo) group by status) q), '{}'::jsonb),
    'applications', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'reference', a.reference,
        'child', a.child_first_name || ' ' || a.child_last_name, 'requested_level', a.requested_level, 'guardian_name', a.guardian_name,
        'status', a.status, 'submitted_at', a.submitted_at, 'updated_at', a.updated_at,
        'documents', (select count(*) from app.application_documents where application_id = a.id)) order by a.submitted_at desc)
      from app.admission_applications a
      where app.visible(v, a.is_demo) and (nullif(p_status, '') is null or a.status = p_status)
        and (a.reference || ' ' || a.child_first_name || ' ' || a.child_last_name || ' ' || a.guardian_name || ' ' || a.guardian_email) ilike v_q), '[]'::jsonb));
end $$;

create or replace function public.api_application_detail(p_token text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; a app.admission_applications;
begin
  v := app.require_role(p_token, array['admissions','admin']);
  select * into a from app.admission_applications where id = p_id;
  if a.id is null or not app.visible(v, a.is_demo) then raise exception 'forbidden' using errcode = '42501'; end if;
  return to_jsonb(a) || jsonb_build_object(
    'documents', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'file_name', file_name, 'mime_type', mime_type, 'size_bytes', size_bytes, 'uploaded_at', uploaded_at))
        from app.application_documents where application_id = a.id), '[]'::jsonb),
    'notes', coalesce((select jsonb_agg(jsonb_build_object('note', n.note, 'author', ac.display_name, 'created_at', n.created_at) order by n.created_at desc)
        from app.application_notes n left join app.accounts ac on ac.id = n.author_account_id where n.application_id = a.id), '[]'::jsonb),
    'student', case when a.student_id is null then null else (select jsonb_build_object('id', s.id, 'name', s.first_name || ' ' || s.last_name,
        'student_code', acc.student_code) from app.students s left join app.accounts acc on acc.id = s.account_id where s.id = a.student_id) end,
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'level', level) order by name)
        from app.classes where app.visible(v, is_demo)), '[]'::jsonb));
end $$;

create or replace function public.api_update_application(p_token text, p_id uuid, p_status text, p_note text, p_decision_note text)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; a app.admission_applications;
begin
  v := app.require_role(p_token, array['admissions','admin']);
  select * into a from app.admission_applications where id = p_id for update;
  if a.id is null or not app.visible(v, a.is_demo) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_status is not null and p_status <> a.status then
    if a.status = 'enrolled' then return jsonb_build_object('ok', false, 'error', 'already_enrolled'); end if;
    if p_status not in ('submitted','under_review','information_required','accepted','rejected') then
      return jsonb_build_object('ok', false, 'error', 'invalid_status');
    end if;
    update app.admission_applications set status = p_status, decision_note = coalesce(nullif(trim(p_decision_note), ''), decision_note), updated_at = now() where id = p_id;
    perform app.audit(v, 'application.status_changed', 'application', a.reference, jsonb_build_object('from', a.status, 'to', p_status));
  end if;
  if length(trim(coalesce(p_note, ''))) > 0 then
    insert into app.application_notes(application_id, author_account_id, note) values (p_id, v.id, left(trim(p_note), 2000));
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_get_document(p_token text, p_doc uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; d record;
begin
  v := app.require_role(p_token, array['admissions','admin']);
  select doc.*, a.is_demo, a.reference into d from app.application_documents doc join app.admission_applications a on a.id = doc.application_id where doc.id = p_doc;
  if d.id is null or not app.visible(v, d.is_demo) then raise exception 'forbidden' using errcode = '42501'; end if;
  perform app.audit(v, 'application.document_viewed', 'application', d.reference, jsonb_build_object('file', d.file_name));
  return jsonb_build_object('file_name', d.file_name, 'mime_type', d.mime_type, 'data_base64', encode(d.content, 'base64'));
end $$;

-- Creates student + guardian + parent login for an accepted application.
-- Safe to call twice: the application row is locked and an existing student is returned.
create or replace function public.api_enrol_application(p_token text, p_id uuid, p_class uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare
  v app.accounts; a app.admission_applications; v_code text; v_pw text; v_acc uuid; v_student uuid; v_guardian uuid;
  v_parent_pw text; v_parent_acc uuid;
begin
  v := app.require_role(p_token, array['admissions','admin']);
  select * into a from app.admission_applications where id = p_id for update;
  if a.id is null or not app.visible(v, a.is_demo) then raise exception 'forbidden' using errcode = '42501'; end if;
  if a.student_id is not null then
    return jsonb_build_object('ok', true, 'already_enrolled', true,
      'student_code', (select acc.student_code from app.students s join app.accounts acc on acc.id = s.account_id where s.id = a.student_id));
  end if;
  if a.status <> 'accepted' then return jsonb_build_object('ok', false, 'error', 'not_accepted'); end if;
  if p_class is not null and not exists(select 1 from app.classes c where c.id = p_class and app.visible(v, c.is_demo)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_code := app.new_student_code();
  v_pw := app.new_temp_password();
  insert into app.accounts(role, student_code, password_hash, display_name, is_demo)
  values ('student', v_code, app.hash_password(v_pw), a.child_first_name, a.is_demo) returning id into v_acc;
  insert into app.students(account_id, first_name, last_name, date_of_birth, level, is_demo)
  values (v_acc, a.child_first_name, a.child_last_name, a.child_date_of_birth, a.requested_level, a.is_demo) returning id into v_student;

  select id, account_id into v_guardian, v_parent_acc from app.guardians where email = a.guardian_email;
  if v_guardian is null then
    insert into app.guardians(full_name, email, phone, is_demo) values (a.guardian_name, a.guardian_email, a.guardian_phone, a.is_demo)
    returning id into v_guardian;
  end if;
  if v_parent_acc is null and not exists(select 1 from app.accounts where email = a.guardian_email) then
    v_parent_pw := app.new_temp_password();
    insert into app.accounts(role, email, password_hash, display_name, is_demo)
    values ('parent', a.guardian_email, app.hash_password(v_parent_pw), a.guardian_name, a.is_demo) returning id into v_parent_acc;
    update app.guardians set account_id = v_parent_acc where id = v_guardian;
  end if;
  insert into app.student_guardians(student_id, guardian_id, relationship) values (v_student, v_guardian, 'Parent/Guardian') on conflict do nothing;
  if p_class is not null then
    insert into app.class_students(class_id, student_id) values (p_class, v_student) on conflict do nothing;
  end if;
  update app.admission_applications set status = 'enrolled', student_id = v_student, updated_at = now() where id = a.id;
  perform app.audit(v, 'application.enrolled', 'application', a.reference, jsonb_build_object('student_id', v_student, 'class_id', p_class));
  return jsonb_build_object('ok', true, 'already_enrolled', false, 'student_id', v_student, 'student_code', v_code,
    'initial_password', v_pw, 'parent_email', a.guardian_email, 'parent_initial_password', v_parent_pw);
end $$;

-- ---------------------------------------------------------------------------
-- Administrator
-- ---------------------------------------------------------------------------
create or replace function public.api_admin_overview(p_token text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  return jsonb_build_object(
    'students', (select count(*) from app.students where app.visible(v, is_demo)),
    'guardians', (select count(*) from app.guardians where app.visible(v, is_demo)),
    'teachers', (select count(*) from app.teachers where app.visible(v, is_demo)),
    'classes', (select count(*) from app.classes where app.visible(v, is_demo)),
    'lessons', (select count(*) from app.lessons where app.visible(v, is_demo)),
    'applications', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) n from app.admission_applications
        where app.visible(v, is_demo) group by status) q), '{}'::jsonb),
    'attempts_week', (select count(*) from app.activity_attempts a join app.students s on s.id = a.student_id
        where a.completed_at > now() - interval '7 days' and app.visible(v, s.is_demo)),
    'avg_score_week', (select round(avg(a.score * 100.0 / a.max_score))::int from app.activity_attempts a join app.students s on s.id = a.student_id
        where a.completed_at > now() - interval '7 days' and app.visible(v, s.is_demo)),
    'area_activity', coalesce((select jsonb_agg(jsonb_build_object('area_name', app.area_name(k), 'attempts', n, 'avg_pct', p) order by n desc)
        from (select a.activity_key k, count(*) n, round(avg(a.score * 100.0 / a.max_score))::int p from app.activity_attempts a
                join app.students s on s.id = a.student_id where app.visible(v, s.is_demo) group by a.activity_key) q), '[]'::jsonb),
    'recent_audit', coalesce((select jsonb_agg(x) from (select jsonb_build_object('action', l.action, 'actor', ac.display_name, 'target', l.target_id, 'created_at', l.created_at) x
        from app.audit_logs l left join app.accounts ac on ac.id = l.actor_account_id order by l.created_at desc limit 6) q), '[]'::jsonb),
    'settings', (select to_jsonb(ss) from app.school_settings ss where id = 1),
    'is_demo', v.is_demo);
end $$;

create or replace function public.api_admin_list(p_token text, p_section text, p_search text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_q text := '%' || coalesce(trim(p_search), '') || '%';
begin
  v := app.require_role(p_token, array['admin']);
  if p_section = 'students' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'first_name', s.first_name, 'last_name', s.last_name, 'nickname', s.nickname,
        'level', s.level, 'account_id', acc.id, 'student_code', acc.student_code, 'status', acc.status, 'protected', coalesce(acc.is_protected, false),
        'last_login_at', acc.last_login_at,
        'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name)) from app.class_students cs join app.classes c on c.id = cs.class_id where cs.student_id = s.id), '[]'::jsonb),
        'guardians', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.full_name)) from app.student_guardians sg join app.guardians g on g.id = sg.guardian_id where sg.student_id = s.id), '[]'::jsonb))
        order by s.first_name)
      from app.students s left join app.accounts acc on acc.id = s.account_id
      where app.visible(v, s.is_demo) and (s.first_name || ' ' || s.last_name || ' ' || coalesce(acc.student_code, '')) ilike v_q), '[]'::jsonb);
  elsif p_section = 'guardians' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.full_name, 'email', g.email, 'phone', g.phone,
        'has_login', g.account_id is not null, 'account_status', acc.status,
        'children', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.first_name || ' ' || s.last_name, 'relationship', sg.relationship))
          from app.student_guardians sg join app.students s on s.id = sg.student_id where sg.guardian_id = g.id), '[]'::jsonb)) order by g.full_name)
      from app.guardians g left join app.accounts acc on acc.id = g.account_id
      where app.visible(v, g.is_demo) and (g.full_name || ' ' || g.email) ilike v_q), '[]'::jsonb);
  elsif p_section = 'teachers' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.full_name, 'email', t.email, 'account_id', acc.id, 'status', acc.status,
        'protected', coalesce(acc.is_protected, false),
        'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name)) from app.class_teachers ct join app.classes c on c.id = ct.class_id where ct.teacher_id = t.id), '[]'::jsonb))
        order by t.full_name)
      from app.teachers t left join app.accounts acc on acc.id = t.account_id
      where app.visible(v, t.is_demo) and (t.full_name || ' ' || t.email) ilike v_q), '[]'::jsonb);
  elsif p_section = 'classes' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'level', c.level, 'school_year', c.school_year,
        'student_count', (select count(*) from app.class_students where class_id = c.id),
        'teachers', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.full_name)) from app.class_teachers ct join app.teachers t on t.id = ct.teacher_id where ct.class_id = c.id), '[]'::jsonb))
        order by c.name)
      from app.classes c where app.visible(v, c.is_demo) and c.name ilike v_q), '[]'::jsonb);
  elsif p_section = 'audit' then
    return coalesce((select jsonb_agg(x) from (select jsonb_build_object('id', l.id, 'action', l.action, 'actor', ac.display_name, 'actor_role', l.actor_role,
        'target_type', l.target_type, 'target_id', l.target_id, 'details', l.details, 'created_at', l.created_at) x
      from app.audit_logs l left join app.accounts ac on ac.id = l.actor_account_id
      where (not v.is_demo or ac.is_demo or ac.id is null) and (l.action || ' ' || coalesce(l.target_id, '') || ' ' || coalesce(ac.display_name, '')) ilike v_q
      order by l.created_at desc limit 200) q), '[]'::jsonb);
  end if;
  raise exception 'invalid_section' using errcode = '22023';
end $$;

create or replace function public.api_admin_create_student(p_token text, p_student jsonb) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_code text; v_pw text; v_acc uuid; v_id uuid; v_class uuid := nullif(p_student->>'class_id', '')::uuid;
  v_guardian uuid := nullif(p_student->>'guardian_id', '')::uuid; v_demo boolean;
begin
  v := app.require_role(p_token, array['admin']);
  select demo_mode into v_demo from app.school_settings where id = 1;
  v_demo := coalesce(v_demo, true) or v.is_demo;
  if v_class is not null and not exists(select 1 from app.classes where id = v_class and app.visible(v, is_demo)) then raise exception 'forbidden' using errcode = '42501'; end if;
  if v_guardian is not null and not exists(select 1 from app.guardians where id = v_guardian and app.visible(v, is_demo)) then raise exception 'forbidden' using errcode = '42501'; end if;
  v_code := app.new_student_code();
  v_pw := app.new_temp_password();
  insert into app.accounts(role, student_code, password_hash, display_name, is_demo)
  values ('student', v_code, app.hash_password(v_pw), trim(p_student->>'first_name'), v_demo) returning id into v_acc;
  insert into app.students(account_id, first_name, last_name, nickname, date_of_birth, level, is_demo)
  values (v_acc, trim(p_student->>'first_name'), trim(p_student->>'last_name'), nullif(trim(p_student->>'nickname'), ''),
          nullif(p_student->>'date_of_birth', '')::date, p_student->>'level', v_demo) returning id into v_id;
  if v_class is not null then insert into app.class_students(class_id, student_id) values (v_class, v_id); end if;
  if v_guardian is not null then insert into app.student_guardians(student_id, guardian_id) values (v_id, v_guardian); end if;
  perform app.audit(v, 'student.created', 'student', v_id::text, jsonb_build_object('student_code', v_code));
  return jsonb_build_object('ok', true, 'student_id', v_id, 'student_code', v_code, 'initial_password', v_pw);
end $$;

create or replace function public.api_admin_student_credentials(p_token text, p_student uuid, p_action text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; s app.students; acc app.accounts; v_new text;
begin
  v := app.require_role(p_token, array['admin']);
  select * into s from app.students where id = p_student;
  if s.id is null or not app.visible(v, s.is_demo) then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into acc from app.accounts where id = s.account_id;
  if acc.is_protected then return jsonb_build_object('ok', false, 'error', 'demo_restricted'); end if;

  if acc.id is null and p_action in ('reset_password', 'regenerate_code', 'activate') then
    v_new := app.new_temp_password();
    insert into app.accounts(role, student_code, password_hash, display_name, is_demo)
    values ('student', app.new_student_code(), app.hash_password(v_new), s.first_name, s.is_demo) returning * into acc;
    update app.students set account_id = acc.id where id = s.id;
    perform app.audit(v, 'student.account_activated', 'student', s.id::text, jsonb_build_object('student_code', acc.student_code));
    return jsonb_build_object('ok', true, 'student_code', acc.student_code, 'initial_password', v_new);
  end if;

  if p_action = 'reset_password' then
    v_new := app.new_temp_password();
    update app.accounts set password_hash = app.hash_password(v_new), password_changed_at = now(), updated_at = now() where id = acc.id;
    delete from app.sessions where account_id = acc.id;
    perform app.audit(v, 'student.password_reset', 'student', s.id::text);
    return jsonb_build_object('ok', true, 'student_code', acc.student_code, 'initial_password', v_new);
  elsif p_action = 'regenerate_code' then
    v_new := app.new_student_code();
    update app.accounts set student_code = v_new, updated_at = now() where id = acc.id;
    delete from app.sessions where account_id = acc.id;
    perform app.audit(v, 'student.code_regenerated', 'student', s.id::text, jsonb_build_object('old', acc.student_code, 'new', v_new));
    return jsonb_build_object('ok', true, 'student_code', v_new);
  end if;
  raise exception 'invalid_action' using errcode = '22023';
end $$;

create or replace function public.api_admin_set_account_status(p_token text, p_account uuid, p_status text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; acc app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  select * into acc from app.accounts where id = p_account;
  if acc.id is null or not app.visible(v, acc.is_demo) then raise exception 'forbidden' using errcode = '42501'; end if;
  if acc.is_protected or acc.id = v.id then return jsonb_build_object('ok', false, 'error', 'demo_restricted'); end if;
  if p_status not in ('active', 'suspended') then raise exception 'invalid_status' using errcode = '22023'; end if;
  update app.accounts set status = p_status, updated_at = now() where id = acc.id;
  if p_status = 'suspended' then delete from app.sessions where account_id = acc.id; end if;
  perform app.audit(v, 'account.' || p_status, 'account', acc.id::text, jsonb_build_object('role', acc.role, 'name', acc.display_name));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_admin_create_guardian(p_token text, p_name text, p_email text, p_phone text, p_student uuid, p_relationship text)
returns jsonb language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_id uuid; v_acc uuid; v_pw text; v_demo boolean;
begin
  v := app.require_role(p_token, array['admin']);
  select coalesce(demo_mode, true) or v.is_demo into v_demo from app.school_settings where id = 1;
  if exists(select 1 from app.guardians where email = lower(trim(p_email))::extensions.citext) or exists(select 1 from app.accounts where email = lower(trim(p_email))::extensions.citext) then
    return jsonb_build_object('ok', false, 'error', 'email_exists');
  end if;
  if p_student is not null and not exists(select 1 from app.students where id = p_student and app.visible(v, is_demo)) then raise exception 'forbidden' using errcode = '42501'; end if;
  v_pw := app.new_temp_password();
  insert into app.accounts(role, email, password_hash, display_name, is_demo) values ('parent', lower(trim(p_email)), app.hash_password(v_pw), trim(p_name), v_demo) returning id into v_acc;
  insert into app.guardians(account_id, full_name, email, phone, is_demo) values (v_acc, trim(p_name), lower(trim(p_email)), nullif(trim(p_phone), ''), v_demo) returning id into v_id;
  if p_student is not null then
    insert into app.student_guardians(student_id, guardian_id, relationship) values (p_student, v_id, coalesce(nullif(trim(p_relationship), ''), 'Parent'));
  end if;
  perform app.audit(v, 'guardian.created', 'guardian', v_id::text, jsonb_build_object('email', lower(trim(p_email))));
  return jsonb_build_object('ok', true, 'guardian_id', v_id, 'initial_password', v_pw);
end $$;

create or replace function public.api_admin_link_guardian(p_token text, p_student uuid, p_guardian uuid, p_relationship text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  if not exists(select 1 from app.students where id = p_student and app.visible(v, is_demo))
     or not exists(select 1 from app.guardians where id = p_guardian and app.visible(v, is_demo)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into app.student_guardians(student_id, guardian_id, relationship) values (p_student, p_guardian, coalesce(nullif(trim(p_relationship), ''), 'Parent'))
  on conflict (student_id, guardian_id) do update set relationship = excluded.relationship;
  perform app.audit(v, 'guardian.linked', 'student', p_student::text, jsonb_build_object('guardian_id', p_guardian));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_admin_create_teacher(p_token text, p_name text, p_email text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_id uuid; v_acc uuid; v_pw text; v_demo boolean;
begin
  v := app.require_role(p_token, array['admin']);
  select coalesce(demo_mode, true) or v.is_demo into v_demo from app.school_settings where id = 1;
  if exists(select 1 from app.accounts where email = lower(trim(p_email))::extensions.citext) then return jsonb_build_object('ok', false, 'error', 'email_exists'); end if;
  v_pw := app.new_temp_password();
  insert into app.accounts(role, email, password_hash, display_name, is_demo) values ('teacher', lower(trim(p_email)), app.hash_password(v_pw), trim(p_name), v_demo) returning id into v_acc;
  insert into app.teachers(account_id, full_name, email, is_demo) values (v_acc, trim(p_name), lower(trim(p_email)), v_demo) returning id into v_id;
  perform app.audit(v, 'teacher.created', 'teacher', v_id::text, jsonb_build_object('email', lower(trim(p_email))));
  return jsonb_build_object('ok', true, 'teacher_id', v_id, 'initial_password', v_pw);
end $$;

create or replace function public.api_admin_create_class(p_token text, p_name text, p_level text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts; v_id uuid; v_demo boolean; v_year text;
begin
  v := app.require_role(p_token, array['admin']);
  select coalesce(demo_mode, true) or v.is_demo, school_year into v_demo, v_year from app.school_settings where id = 1;
  insert into app.classes(name, level, school_year, is_demo) values (trim(p_name), p_level, v_year, v_demo) returning id into v_id;
  perform app.audit(v, 'class.created', 'class', v_id::text, jsonb_build_object('name', trim(p_name)));
  return jsonb_build_object('ok', true, 'class_id', v_id);
end $$;

create or replace function public.api_admin_assign_teacher(p_token text, p_class uuid, p_teacher uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  if not exists(select 1 from app.classes where id = p_class and app.visible(v, is_demo))
     or not exists(select 1 from app.teachers where id = p_teacher and app.visible(v, is_demo)) then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into app.class_teachers(class_id, teacher_id) values (p_class, p_teacher) on conflict do nothing;
  perform app.audit(v, 'class.teacher_assigned', 'class', p_class::text, jsonb_build_object('teacher_id', p_teacher));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_admin_enrol_student(p_token text, p_class uuid, p_student uuid) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  if not exists(select 1 from app.classes where id = p_class and app.visible(v, is_demo))
     or not exists(select 1 from app.students where id = p_student and app.visible(v, is_demo)) then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into app.class_students(class_id, student_id) values (p_class, p_student) on conflict do nothing;
  perform app.audit(v, 'class.student_enrolled', 'class', p_class::text, jsonb_build_object('student_id', p_student));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_admin_set_lesson_status(p_token text, p_lesson uuid, p_status text) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  if p_status not in ('draft','published','archived') then raise exception 'invalid_status' using errcode = '22023'; end if;
  if not exists(select 1 from app.lessons where id = p_lesson and app.visible(v, is_demo)) then raise exception 'forbidden' using errcode = '42501'; end if;
  update app.lessons set status = p_status, updated_at = now() where id = p_lesson;
  perform app.audit(v, 'lesson.status_changed', 'lesson', p_lesson::text, jsonb_build_object('status', p_status));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.api_admin_update_settings(p_token text, p_settings jsonb) returns jsonb
language plpgsql security definer set search_path = app, extensions as $$
declare v app.accounts;
begin
  v := app.require_role(p_token, array['admin']);
  if v.is_demo then return jsonb_build_object('ok', false, 'error', 'demo_restricted'); end if;
  update app.school_settings set
    school_name = coalesce(nullif(trim(p_settings->>'school_name'), ''), school_name),
    contact_email = coalesce(nullif(trim(p_settings->>'contact_email'), ''), contact_email),
    school_year = coalesce(nullif(trim(p_settings->>'school_year'), ''), school_year),
    daily_goal = coalesce((p_settings->>'daily_goal')::int, daily_goal),
    updated_at = now() where id = 1;
  perform app.audit(v, 'settings.updated', 'settings', '1', p_settings);
  return jsonb_build_object('ok', true);
end $$;

-- Lock down: only the api_* functions are callable through the Data API.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'app' loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'api\_%' loop
    execute format('revoke all on function %s from public', f.sig);
    execute format('grant execute on function %s to anon, authenticated', f.sig);
  end loop;
end $$;
