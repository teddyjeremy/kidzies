"use server";

import { z } from "zod";
import { rpc } from "@/lib/db/rpc";
import { requireActionRole } from "@/lib/auth/session";
import { check, firstIssue, run, type ActionResult } from "@/lib/actions";
import { newStudentSchema } from "@/lib/validation";
import { UserError } from "@/lib/db/errors";

type Res = { ok: boolean; error?: string } & Record<string, unknown>;
const uuid = z.string().uuid();
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function call(fn: `api_${string}`, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { token } = await requireActionRole(["admin"]);
  const { ok: _ok, error: _e, ...rest } = check(await rpc<Res>(fn, { p_token: token, ...args }));
  return rest;
}
function id(v: string): string {
  if (!uuid.safeParse(v).success) throw new UserError("Please choose an item from the list.");
  return v;
}

export async function createStudent(form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => {
    const p = newStudentSchema.safeParse(Object.fromEntries(["first_name", "last_name", "nickname", "date_of_birth", "level", "class_id", "guardian_id"].map((k) => [k, str(form, k)])));
    if (!p.success) firstIssue(p.error.issues);
    return call("api_admin_create_student", { p_student: p.data });
  });
}

export async function studentCredentials(studentId: string, action: "reset_password" | "regenerate_code" | "activate"): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => call("api_admin_student_credentials", { p_student: id(studentId), p_action: action }));
}

export async function setAccountStatus(accountId: string, status: "active" | "suspended"): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => call("api_admin_set_account_status", { p_account: id(accountId), p_status: status }));
}

export async function enrolStudent(studentId: string, form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => call("api_admin_enrol_student", { p_student: id(studentId), p_class: id(str(form, "class_id")) }));
}

export async function createGuardian(form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => {
    const p = z.object({
      name: z.string().min(2, "Name is required").max(100),
      email: z.string().toLowerCase().email("Please enter a valid email."),
      phone: z.string().max(24).optional(),
      student: z.string().uuid().optional().or(z.literal("")),
      relationship: z.string().max(40).optional(),
    }).safeParse({ name: str(form, "name"), email: str(form, "email"), phone: str(form, "phone"), student: str(form, "student_id"), relationship: str(form, "relationship") });
    if (!p.success) firstIssue(p.error.issues);
    return call("api_admin_create_guardian", { p_name: p.data.name, p_email: p.data.email, p_phone: p.data.phone || null, p_student: p.data.student || null, p_relationship: p.data.relationship || "Parent/Guardian" });
  });
}

export async function linkGuardian(guardianId: string, form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => call("api_admin_link_guardian", { p_guardian: id(guardianId), p_student: id(str(form, "student_id")), p_relationship: str(form, "relationship").slice(0, 40) || "Parent/Guardian" }));
}

export async function createTeacher(form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => {
    const p = z.object({ name: z.string().min(2, "Name is required").max(100), email: z.string().toLowerCase().email("Please enter a valid email.") }).safeParse({ name: str(form, "name"), email: str(form, "email") });
    if (!p.success) firstIssue(p.error.issues);
    return call("api_admin_create_teacher", { p_name: p.data.name, p_email: p.data.email });
  });
}

export async function createClass(form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => {
    const p = z.object({ name: z.string().min(2, "Name is required").max(60), level: z.enum(["Pre-K", "KG1", "KG2"]) }).safeParse({ name: str(form, "name"), level: str(form, "level") });
    if (!p.success) firstIssue(p.error.issues);
    return call("api_admin_create_class", { p_name: p.data.name, p_level: p.data.level });
  });
}

export async function assignTeacher(classId: string, form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => call("api_admin_assign_teacher", { p_class: id(classId), p_teacher: id(str(form, "teacher_id")) }));
}

export async function setLessonStatus(lessonId: string, status: "draft" | "published" | "archived"): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => call("api_admin_set_lesson_status", { p_lesson: id(lessonId), p_status: status }));
}

export async function updateSettings(form: FormData): Promise<ActionResult<Record<string, unknown>>> {
  return run(async () => {
    const p = z.object({
      school_name: z.string().min(2).max(100),
      contact_email: z.string().email("Please enter a valid email."),
      school_year: z.string().regex(/^\d{4}\/\d{2}$/, "Use the format 2026/27"),
      daily_goal: z.coerce.number().int().min(1).max(10),
    }).safeParse({ school_name: str(form, "school_name"), contact_email: str(form, "contact_email"), school_year: str(form, "school_year"), daily_goal: str(form, "daily_goal") });
    if (!p.success) firstIssue(p.error.issues);
    return call("api_admin_update_settings", { p_settings: p.data });
  });
}
