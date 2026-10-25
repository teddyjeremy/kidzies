import type { ActivityType, AreaKey, Level, StudentStats } from "@/types";

export interface TeacherClass { id: string; name: string; level: Level; school_year: string; student_count: number }
export interface ActivityRow {
  attempt_id: string; student_id: string; student: string; area_name: string; lesson_title: string | null;
  score: number; max_score: number; stars: number; completed_at: string; feedback: string | null; mistakes?: string[];
}
export interface AssignmentRow { id: string; title: string; area_name: string; due_at: string | null; target: string; assigned: number; completed: number }
export interface TeacherOverview {
  teacher: { name: string; email: string };
  classes: TeacherClass[];
  total_students: number;
  recent_activity: ActivityRow[];
  assignments: AssignmentRow[];
  needs_support: { student_id: string; name: string; stats: StudentStats; reason: string }[];
  lesson_count: number;
}
export interface ClassDetail {
  id: string; name: string; level: Level; school_year: string;
  students: { id: string; first_name: string; last_name: string; nickname: string | null; stats: StudentStats; attendance_today: string | null }[];
}
export interface StudentListRow { id: string; first_name: string; last_name: string; level: Level; class: string; class_id: string; stats: StudentStats }
export interface LessonRow {
  id: string; title: string; subject: string; subject_slug: string; level: Level; activity_type: ActivityType; location: AreaKey;
  area_name: string; status: string; question_count: number; mine: boolean; author: string | null; updated_at: string; assignment_count: number;
}
export interface LessonFull {
  id: string; title: string; subject_slug: string; level: Level; description: string; objectives: string[]; instructions: string;
  activity_type: ActivityType; location: AreaKey; media_url: string | null;
  questions: { prompt: string; emoji?: string; options?: string[]; answer?: string; object?: string; target?: string }[];
  pass_mark: number; points_per_question: number; status: "draft" | "published" | "archived"; mine: boolean; area_name: string;
}
export interface AssignmentDetail {
  id: string; due_at: string | null; note: string | null; class_id: string | null;
  lesson: { id: string; title: string; area_name: string; activity_type: ActivityType; questions: number };
  submissions: { student_id: string; name: string; attempt: { id: string; score: number; max_score: number; stars: number; mistakes: string[]; completed_at: string; feedback: string | null } | null }[];
  common_mistakes: { prompt: string; count: number }[];
}
export interface ApplicationRow {
  id: string; reference: string; child: string; requested_level: Level; guardian_name: string; status: string;
  submitted_at: string; updated_at: string; documents: number;
}
export interface ApplicationDetail {
  id: string; reference: string; child_first_name: string; child_last_name: string; child_date_of_birth: string; requested_level: Level;
  guardian_name: string; guardian_email: string; guardian_phone: string; emergency_contact_name: string | null; emergency_contact_phone: string | null;
  notes_from_family: string | null; status: string; decision_note: string | null; submitted_at: string; updated_at: string; is_demo: boolean;
  documents: { id: string; file_name: string; mime_type: string; size_bytes: number; uploaded_at: string }[];
  notes: { note: string; author: string | null; created_at: string }[];
  student: { id: string; name: string; student_code: string | null } | null;
  classes: { id: string; name: string; level: Level }[];
}
