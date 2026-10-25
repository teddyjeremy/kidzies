export type Role = "student" | "parent" | "teacher" | "admin" | "admissions";

export type AreaKey =
  | "abc-garden"
  | "number-playground"
  | "animal-world"
  | "storytime"
  | "shapes-colours"
  | "creative-studio"
  | "life-skills";

export type ActivityType = "multiple_choice" | "matching" | "counting" | "letter" | "shape" | "colour";

export type Level = "Pre-K" | "KG1" | "KG2";

export interface CurrentUser {
  account_id: string;
  role: Role;
  display_name: string;
  email: string | null;
  is_demo: boolean;
  is_protected: boolean;
  sound_enabled: boolean;
  student: { id: string; first_name: string; nickname: string | null; level: Level } | null;
}

export interface LessonQuestion {
  prompt: string;
  emoji?: string;
  options?: string[];
  answer?: string;
  object?: string;
  target?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  instructions: string;
  activity_type: ActivityType;
  location: AreaKey;
  questions: LessonQuestion[];
  media_url: string | null;
}

export interface StudentAssignmentSummary {
  id: string;
  title: string;
  area: AreaKey;
  activity_type: ActivityType;
  due_at: string | null;
  completed: boolean;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface StudentHome {
  student: { id: string; first_name: string; nickname: string | null; level: Level };
  daily_goal: number;
  today_count: number;
  total_stars: number;
  progress: Partial<Record<AreaKey, { completions: number; best_stars: number; best_score_pct: number }>>;
  assignments: StudentAssignmentSummary[];
  achievements: Achievement[];
  feedback: { feedback: string; area: string; at: string }[];
}

export interface AttemptResult {
  attempt_id: string;
  score: number;
  max_score: number;
  stars: number;
  mistakes: string[];
  new_achievements: { key: string; title: string; icon: string }[];
  total_stars: number;
}

export interface ChildSummary {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  level: Level;
  classes: { id: string; name: string; teachers: { name: string; email: string }[] }[];
  week_count: number;
  week_areas: string[];
  total_attempts: number;
  total_stars: number;
  progress: { area: AreaKey; area_name: string; completions: number; best_score_pct: number; best_stars: number; last_played_at: string }[];
  area_averages: { area: AreaKey; area_name: string; avg_pct: number; attempts: number }[];
  recent_attempts: {
    id: string; area: AreaKey; area_name: string; lesson_title: string | null; score: number; max_score: number;
    stars: number; mistakes: string[]; completed_at: string; feedback: string | null;
  }[];
  assignments: { id: string; title: string; area: AreaKey; area_name: string; due_at: string | null; note: string | null; completed: boolean; best_stars: number | null }[];
  attendance: { day: string; status: string; note: string | null }[];
  observations: { note: string; teacher: string | null; created_at: string; shared: boolean }[];
  achievements: { key: string; title: string; icon: string; earned_at: string }[];
}

export interface StudentStats {
  attempts: number;
  avg_pct: number | null;
  recent_avg_pct: number | null;
  last_at: string | null;
  stars: number;
}
