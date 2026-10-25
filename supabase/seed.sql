-- Kidzies demonstration data. Idempotent: safe to run any number of times.
-- Every record here is fictional and flagged is_demo = true.
-- Run with:  psql "$SUPABASE_DB_URL" -f supabase/seed.sql   (or paste into the SQL editor)

begin;

insert into app.school_settings(id) values (1) on conflict (id) do nothing;

insert into app.subjects(slug, name) values
  ('literacy', 'Literacy & Phonics'), ('numeracy', 'Numbers & Counting'), ('shapes', 'Shapes & Colours'),
  ('science', 'Science Discovery'), ('creative-arts', 'Creative Arts'), ('social-emotional', 'Feelings & Friendship'),
  ('life-skills', 'Life Skills')
on conflict (slug) do update set name = excluded.name;

insert into app.lesson_activities(key, title, location, description) values
  ('abc-garden', 'Alphabet Garden', 'abc-garden', 'Match toy letters with things that start with their sound.'),
  ('number-playground', 'Number Playground', 'number-playground', 'Collect and count apples, balloons and blocks.'),
  ('animal-world', 'Animal World', 'animal-world', 'Meet friendly animals, hear their sounds and sort them by home.'),
  ('storytime', 'Storytime Corner', 'storytime', 'Short narrated picture stories with gentle questions.'),
  ('shapes-colours', 'Shapes & Colours', 'shapes-colours', 'Drag shapes into matching colourful buckets.'),
  ('creative-studio', 'Creative Studio', 'creative-studio', 'Colour in friendly pictures with a big crayon palette.'),
  ('life-skills', 'Life Skills Village', 'life-skills', 'Everyday routines, feelings, sharing and staying safe.')
on conflict (key) do update set title = excluded.title, description = excluded.description;

insert into app.achievements(key, title, description, icon) values
  ('first-star', 'First Star', 'Finished a first activity', 'star'),
  ('abc-explorer', 'ABC Explorer', 'Got three stars in the Alphabet Garden', 'book-a'),
  ('counting-champ', 'Counting Champ', 'Got three stars in the Number Playground', 'calculator'),
  ('shape-spotter', 'Shape Spotter', 'Got three stars in Shapes & Colours', 'shapes'),
  ('animal-friend', 'Animal Friend', 'Visited Animal World', 'paw-print'),
  ('story-lover', 'Story Lover', 'Listened to a story', 'book-open'),
  ('little-artist', 'Little Artist', 'Coloured a picture in the studio', 'palette'),
  ('kind-helper', 'Kind Helper', 'Finished a Life Skills activity', 'heart-handshake'),
  ('adventurer', 'Adventurer', 'Played in four different areas', 'map'),
  ('star-collector', 'Star Collector', 'Collected ten stars', 'sparkles'),
  ('homework-hero', 'Homework Hero', 'Finished a teacher activity', 'medal')
on conflict (key) do update set title = excluded.title, description = excluded.description, icon = excluded.icon;

-- Demo accounts (protected: their credentials cannot be changed from the app).
insert into app.accounts(id, role, email, student_code, password_hash, display_name, is_demo, is_protected) values
  ('00000000-0000-4000-8000-000000000001', 'student', null, 'QF5G7J90', app.hash_password('KidziesDemo123!'), 'Amara', true, true),
  ('00000000-0000-4000-8000-000000000002', 'parent', 'parent@demo.kidzies.local', null, app.hash_password('KidziesDemo123!'), 'Grace Okafor', true, true),
  ('00000000-0000-4000-8000-000000000003', 'teacher', 'teacher@demo.kidzies.local', null, app.hash_password('KidziesDemo123!'), 'Ms. Daniela Rivers', true, true),
  ('00000000-0000-4000-8000-000000000004', 'admin', 'admin@demo.kidzies.local', null, app.hash_password('KidziesDemo123!'), 'Sam Patel', true, true),
  ('00000000-0000-4000-8000-000000000005', 'admissions', 'admissions@demo.kidzies.local', null, app.hash_password('KidziesDemo123!'), 'Jordan Mwangi', true, true)
on conflict (id) do update set password_hash = excluded.password_hash, status = 'active', is_demo = true, is_protected = true,
  display_name = excluded.display_name;

-- Classmates (their passwords are random and unknown; staff can reset them).
insert into app.accounts(id, role, student_code, password_hash, display_name, is_demo) values
  ('00000000-0000-4000-8000-000000000011', 'student', 'HN4P7RTW', app.hash_password(encode(extensions.gen_random_bytes(16), 'hex')), 'Leo', true),
  ('00000000-0000-4000-8000-000000000012', 'student', 'ZK8M3QXA', app.hash_password(encode(extensions.gen_random_bytes(16), 'hex')), 'Zuri', true),
  ('00000000-0000-4000-8000-000000000013', 'student', 'TB6V9CEJ', app.hash_password(encode(extensions.gen_random_bytes(16), 'hex')), 'Tomas', true),
  ('00000000-0000-4000-8000-000000000014', 'student', 'MW2R5GYD', app.hash_password(encode(extensions.gen_random_bytes(16), 'hex')), 'Mia', true),
  ('00000000-0000-4000-8000-000000000015', 'student', 'NP7X4HUS', app.hash_password(encode(extensions.gen_random_bytes(16), 'hex')), 'Noah', true)
on conflict (id) do nothing;

insert into app.students(id, account_id, first_name, last_name, nickname, date_of_birth, level, is_demo) values
  ('00000000-0000-4000-8001-000000000001', '00000000-0000-4000-8000-000000000001', 'Amara', 'Okafor', 'Mara', '2021-04-12', 'KG1', true),
  ('00000000-0000-4000-8001-000000000011', '00000000-0000-4000-8000-000000000011', 'Leo', 'Fischer', null, '2021-02-03', 'KG1', true),
  ('00000000-0000-4000-8001-000000000012', '00000000-0000-4000-8000-000000000012', 'Zuri', 'Kamau', null, '2021-07-21', 'KG1', true),
  ('00000000-0000-4000-8001-000000000013', '00000000-0000-4000-8000-000000000013', 'Tomas', 'Silva', 'Tommy', '2021-01-30', 'KG1', true),
  ('00000000-0000-4000-8001-000000000014', '00000000-0000-4000-8000-000000000014', 'Mia', 'Novak', null, '2021-09-09', 'KG1', true),
  ('00000000-0000-4000-8001-000000000015', '00000000-0000-4000-8000-000000000015', 'Noah', 'Lindqvist', null, '2022-03-14', 'Pre-K', true)
on conflict (id) do nothing;

insert into app.guardians(id, account_id, full_name, email, phone, is_demo) values
  ('00000000-0000-4000-8002-000000000001', '00000000-0000-4000-8000-000000000002', 'Grace Okafor', 'parent@demo.kidzies.local', '+000 000 0001 (demo)', true),
  ('00000000-0000-4000-8002-000000000002', null, 'Henrik Fischer', 'henrik.fischer@demo.kidzies.local', '+000 000 0002 (demo)', true)
on conflict (id) do nothing;

insert into app.student_guardians(student_id, guardian_id, relationship) values
  ('00000000-0000-4000-8001-000000000001', '00000000-0000-4000-8002-000000000001', 'Mother'),
  ('00000000-0000-4000-8001-000000000011', '00000000-0000-4000-8002-000000000002', 'Father')
on conflict do nothing;

insert into app.teachers(id, account_id, full_name, email, is_demo) values
  ('00000000-0000-4000-8003-000000000001', '00000000-0000-4000-8000-000000000003', 'Ms. Daniela Rivers', 'teacher@demo.kidzies.local', true)
on conflict (id) do nothing;

insert into app.classes(id, name, level, school_year, is_demo) values
  ('00000000-0000-4000-8004-000000000001', 'Sunflower Class', 'KG1', '2026/27', true),
  ('00000000-0000-4000-8004-000000000002', 'Little Acorns', 'Pre-K', '2026/27', true)
on conflict (id) do nothing;

insert into app.class_teachers(class_id, teacher_id) values
  ('00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8003-000000000001')
on conflict do nothing;

insert into app.class_students(class_id, student_id) values
  ('00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8001-000000000001'),
  ('00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8001-000000000011'),
  ('00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8001-000000000012'),
  ('00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8001-000000000013'),
  ('00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8001-000000000014'),
  ('00000000-0000-4000-8004-000000000002', '00000000-0000-4000-8001-000000000015')
on conflict do nothing;

insert into app.lessons(id, title, subject_id, level, description, objectives, instructions, activity_type, location, questions, status, created_by, is_demo) values
  ('00000000-0000-4000-8005-000000000001', 'Letter Sounds A to E', (select id from app.subjects where slug = 'literacy'), 'KG1',
   'Hear the first sound of everyday words and find the matching letter.', array['Recognise letters A–E', 'Link a letter to its sound'],
   'Listen to the word, then tap the letter it starts with.', 'letter', 'abc-garden',
   '[{"prompt":"Apple starts with…","emoji":"🍎","options":["A","B","C"],"answer":"A"},
     {"prompt":"Ball starts with…","emoji":"⚽","options":["D","B","E"],"answer":"B"},
     {"prompt":"Cat starts with…","emoji":"🐱","options":["C","A","E"],"answer":"C"},
     {"prompt":"Duck starts with…","emoji":"🦆","options":["B","D","C"],"answer":"D"},
     {"prompt":"Egg starts with…","emoji":"🥚","options":["E","A","D"],"answer":"E"}]'::jsonb,
   'published', '00000000-0000-4000-8003-000000000001', true),
  ('00000000-0000-4000-8005-000000000002', 'Count to Five', (select id from app.subjects where slug = 'numeracy'), 'KG1',
   'Collect the right number of toys from the playground.', array['Count objects one by one up to 5'],
   'Tap the toys to collect them, then press Done.', 'counting', 'number-playground',
   '[{"prompt":"Collect 3 apples","object":"apple","target":"3"},
     {"prompt":"Collect 5 stars","object":"star","target":"5"},
     {"prompt":"Collect 4 balloons","object":"balloon","target":"4"}]'::jsonb,
   'published', '00000000-0000-4000-8003-000000000001', true),
  ('00000000-0000-4000-8005-000000000003', 'Shape Hunt', (select id from app.subjects where slug = 'shapes'), 'KG1',
   'Find circles, squares and triangles.', array['Name basic 2D shapes'],
   'Look at the picture and tap the right shape name.', 'shape', 'shapes-colours',
   '[{"prompt":"Which shape is round like a wheel?","emoji":"⚪","options":["Circle","Square","Triangle"],"answer":"Circle"},
     {"prompt":"Which shape has 3 sides?","emoji":"🔺","options":["Square","Triangle","Circle"],"answer":"Triangle"},
     {"prompt":"Which shape has 4 equal sides?","emoji":"🟦","options":["Square","Circle","Star"],"answer":"Square"}]'::jsonb,
   'published', '00000000-0000-4000-8003-000000000001', true),
  ('00000000-0000-4000-8005-000000000004', 'Colour Match', (select id from app.subjects where slug = 'shapes'), 'KG1',
   'Match everyday things with their colour.', array['Name primary colours'],
   'Tap the colour of each thing.', 'colour', 'shapes-colours',
   '[{"prompt":"What colour is a banana?","emoji":"🍌","options":["Yellow","Blue","Red"],"answer":"Yellow"},
     {"prompt":"What colour is the sky on a sunny day?","emoji":"☀️","options":["Green","Blue","Pink"],"answer":"Blue"},
     {"prompt":"What colour is grass?","emoji":"🌱","options":["Green","Orange","Purple"],"answer":"Green"}]'::jsonb,
   'published', '00000000-0000-4000-8003-000000000001', true),
  ('00000000-0000-4000-8005-000000000005', 'Farm Animal Homes (draft)', (select id from app.subjects where slug = 'science'), 'KG1',
   'Where do farm animals live?', array['Match animals to their homes'], 'Tap where each animal lives.', 'multiple_choice', 'animal-world',
   '[{"prompt":"Where does a cow sleep?","emoji":"🐄","options":["Barn","Pond","Nest"],"answer":"Barn"}]'::jsonb,
   'draft', '00000000-0000-4000-8003-000000000001', true)
on conflict (id) do nothing;

insert into app.assignments(id, lesson_id, class_id, student_id, assigned_by, due_at, note, created_at) values
  ('00000000-0000-4000-8006-000000000001', '00000000-0000-4000-8005-000000000001', '00000000-0000-4000-8004-000000000001', null,
   '00000000-0000-4000-8003-000000000001', now() + interval '2 days', 'Practise our letter sounds!', now() - interval '3 days'),
  ('00000000-0000-4000-8006-000000000002', '00000000-0000-4000-8005-000000000002', '00000000-0000-4000-8004-000000000001', null,
   '00000000-0000-4000-8003-000000000001', now() + interval '4 days', null, now() - interval '1 day'),
  ('00000000-0000-4000-8006-000000000003', '00000000-0000-4000-8005-000000000003', null, '00000000-0000-4000-8001-000000000001',
   '00000000-0000-4000-8003-000000000001', now() + interval '6 days', 'A shape challenge just for you, Amara!', now() - interval '1 day')
on conflict (id) do nothing;

insert into app.activity_attempts(id, student_id, activity_key, assignment_id, lesson_id, score, max_score, stars, answers, mistakes, duration_seconds, completed_at) values
  ('00000000-0000-4000-8007-000000000001', '00000000-0000-4000-8001-000000000001', 'abc-garden', '00000000-0000-4000-8006-000000000001', '00000000-0000-4000-8005-000000000001', 4, 5, 2, '["A","B","C","B","E"]', '["Duck starts with…"]', 140, now() - interval '2 days'),
  ('00000000-0000-4000-8007-000000000002', '00000000-0000-4000-8001-000000000001', 'number-playground', null, null, 5, 5, 3, '[]', '[]', 95, now() - interval '1 day'),
  ('00000000-0000-4000-8007-000000000003', '00000000-0000-4000-8001-000000000011', 'abc-garden', '00000000-0000-4000-8006-000000000001', '00000000-0000-4000-8005-000000000001', 5, 5, 3, '["A","B","C","D","E"]', '[]', 120, now() - interval '2 days'),
  ('00000000-0000-4000-8007-000000000004', '00000000-0000-4000-8001-000000000012', 'abc-garden', '00000000-0000-4000-8006-000000000001', '00000000-0000-4000-8005-000000000001', 2, 5, 1, '["B","B","A","B","E"]', '["Apple starts with…","Cat starts with…","Duck starts with…"]', 200, now() - interval '1 day'),
  ('00000000-0000-4000-8007-000000000005', '00000000-0000-4000-8001-000000000012', 'number-playground', '00000000-0000-4000-8006-000000000002', '00000000-0000-4000-8005-000000000002', 1, 3, 1, '["3","4","3"]', '["Collect 5 stars","Collect 4 balloons"]', 180, now() - interval '20 hours'),
  ('00000000-0000-4000-8007-000000000006', '00000000-0000-4000-8001-000000000013', 'shapes-colours', null, null, 6, 6, 3, '[]', '[]', 110, now() - interval '3 days'),
  ('00000000-0000-4000-8007-000000000007', '00000000-0000-4000-8001-000000000014', 'storytime', null, null, 3, 3, 3, '[]', '[]', 240, now() - interval '9 days'),
  ('00000000-0000-4000-8007-000000000008', '00000000-0000-4000-8001-000000000015', 'abc-garden', null, null, 3, 5, 2, '[]', '[]', 160, now() - interval '2 days')
on conflict (id) do nothing;

-- Rebuild per-area progress from the attempts above.
insert into app.student_progress(student_id, activity_key, completions, best_score_pct, best_stars, last_played_at)
select student_id, activity_key, count(*), max(round(score * 100.0 / max_score))::int, max(stars), max(completed_at)
  from app.activity_attempts where student_id in (select id from app.students where is_demo)
 group by student_id, activity_key
on conflict (student_id, activity_key) do update set completions = excluded.completions,
  best_score_pct = excluded.best_score_pct, best_stars = excluded.best_stars, last_played_at = excluded.last_played_at;

insert into app.student_achievements(student_id, achievement_key)
select s.id, 'first-star' from app.students s where s.is_demo and exists(select 1 from app.activity_attempts where student_id = s.id)
on conflict do nothing;
insert into app.student_achievements(student_id, achievement_key) values
  ('00000000-0000-4000-8001-000000000001', 'counting-champ'),
  ('00000000-0000-4000-8001-000000000001', 'homework-hero')
on conflict do nothing;

insert into app.assessment_results(id, attempt_id, teacher_id, feedback) values
  ('00000000-0000-4000-8008-000000000001', '00000000-0000-4000-8007-000000000001', '00000000-0000-4000-8003-000000000001',
   'Lovely work, Amara! Let''s practise the "d" sound in duck together.'),
  ('00000000-0000-4000-8008-000000000002', '00000000-0000-4000-8007-000000000004', '00000000-0000-4000-8003-000000000001',
   'Good try, Zuri. We will play the letter sound game again in class.')
on conflict (id) do nothing;

insert into app.attendance_records(student_id, class_id, day, status, recorded_by)
select s.student_id, s.class_id, d::date, case when s.student_id = '00000000-0000-4000-8001-000000000012' and d::date = current_date - 1 then 'late' else 'present' end,
       '00000000-0000-4000-8003-000000000001'
  from app.class_students s, generate_series(current_date - 3, current_date - 1, interval '1 day') d
 where s.class_id = '00000000-0000-4000-8004-000000000001'
on conflict (student_id, class_id, day) do nothing;

insert into app.observations(id, student_id, teacher_id, note, share_with_family) values
  ('00000000-0000-4000-8009-000000000001', '00000000-0000-4000-8001-000000000001', '00000000-0000-4000-8003-000000000001',
   'Amara counted to ten confidently during our online circle time and helped a friend.', true)
on conflict (id) do nothing;

insert into app.announcements(id, title, body, audience, class_id, is_demo) values
  ('00000000-0000-4000-800a-000000000001', 'Welcome to the new term!', 'This term Sunflower Class explores letters A–J, counting to 10 and shapes all around us. Thank you for learning with us at home.', 'families', '00000000-0000-4000-8004-000000000001', true),
  ('00000000-0000-4000-800a-000000000002', 'Screen-time tip', 'Short, happy sessions work best: 10–15 minutes of Kidzies, then a stretch, a snack or a story together.', 'families', null, true)
on conflict (id) do nothing;

insert into app.admission_applications(id, reference, child_first_name, child_last_name, child_date_of_birth, requested_level, guardian_name, guardian_email, guardian_phone,
    emergency_contact_name, emergency_contact_phone, consent_data, consent_terms, status, decision_note, is_demo, submitted_at) values
  ('00000000-0000-4000-800b-000000000001', 'KZ-2026-DEMO01', 'Ayo', 'Bello', '2021-11-02', 'KG1', 'Funmi Bello', 'funmi.bello@demo.kidzies.local', '+000 000 0101 (demo)', 'Tunde Bello', '+000 000 0102 (demo)', true, true, 'submitted', null, true, now() - interval '2 days'),
  ('00000000-0000-4000-800b-000000000002', 'KZ-2026-DEMO02', 'Lina', 'Haddad', '2022-05-18', 'Pre-K', 'Rami Haddad', 'rami.haddad@demo.kidzies.local', '+000 000 0201 (demo)', null, null, true, true, 'under_review', null, true, now() - interval '5 days'),
  ('00000000-0000-4000-800b-000000000003', 'KZ-2026-DEMO03', 'Kofi', 'Mensah', '2021-08-25', 'KG1', 'Esi Mensah', 'esi.mensah@demo.kidzies.local', '+000 000 0301 (demo)', null, null, true, true, 'information_required', 'Please upload a proof-of-age document.', true, now() - interval '8 days'),
  ('00000000-0000-4000-800b-000000000004', 'KZ-2026-DEMO04', 'Sofia', 'Rossi', '2021-06-11', 'KG1', 'Marco Rossi', 'marco.rossi@demo.kidzies.local', '+000 000 0401 (demo)', null, null, true, true, 'accepted', 'Welcome to Kidzies!', true, now() - interval '10 days')
on conflict (id) do nothing;

commit;
