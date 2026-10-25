"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { rpc } from "@/lib/db/rpc";
import { requireActionRole } from "@/lib/auth/session";
import { assignmentSchema, lessonSchema, type LessonInput } from "@/lib/validation";
import { firstIssue, run, type ActionResult } from "@/lib/actions";

export async function saveLesson(input: LessonInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = lessonSchema.safeParse(input);
    if (!parsed.success) firstIssue(parsed.error.issues);
    const { token } = await requireActionRole(["teacher", "admin"]);
    const l = parsed.data;
    const questions = l.questions.map((q) =>
      l.activity_type === "counting"
        ? { prompt: q.prompt, object: q.object || "apple", target: String(q.target) }
        : { prompt: q.prompt, emoji: q.emoji || undefined, options: q.options, answer: q.answer },
    );
    const res = await rpc<{ id: string }>("api_save_lesson", { p_token: token, p_lesson: { ...l, questions } });
    revalidatePath("/teacher/lessons");
    return res;
  });
}

export async function createAssignment(form: FormData): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = assignmentSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) firstIssue(parsed.error.issues);
    const { token } = await requireActionRole(["teacher"]);
    const [kind, id] = parsed.data.target.split(":");
    const due = parsed.data.due_at ? new Date(`${parsed.data.due_at}T17:00:00`).toISOString() : null;
    const res = await rpc<{ id: string }>("api_create_assignment", {
      p_token: token, p_lesson: parsed.data.lesson_id, p_class: kind === "class" ? id : null, p_student: kind === "student" ? id : null,
      p_due: due, p_note: parsed.data.note || null,
    });
    revalidatePath("/teacher/assignments");
    return res;
  });
}

const uuid = z.string().uuid();

export async function giveFeedback(attemptId: string, form: FormData): Promise<ActionResult> {
  return run(async () => {
    const text = z.string().trim().min(2, "Write a short note").max(1000).safeParse(form.get("feedback"));
    if (!text.success) firstIssue(text.error.issues);
    if (!uuid.safeParse(attemptId).success) firstIssue([{ message: "Invalid attempt" }]);
    const { token } = await requireActionRole(["teacher"]);
    await rpc("api_give_feedback", { p_token: token, p_attempt: attemptId, p_feedback: text.data });
    return undefined;
  });
}

export async function recordAttendance(classId: string, studentId: string, form: FormData): Promise<ActionResult> {
  return run(async () => {
    const status = z.enum(["present", "absent", "late", "excused"]).safeParse(form.get("status"));
    if (!status.success) firstIssue([{ message: "Choose a status" }]);
    const { token } = await requireActionRole(["teacher"]);
    await rpc("api_record_attendance", { p_token: token, p_class: classId, p_student: studentId, p_status: status.data, p_note: String(form.get("note") ?? "") });
    return undefined;
  });
}

export async function addObservation(studentId: string, form: FormData): Promise<ActionResult> {
  return run(async () => {
    const note = z.string().trim().min(2, "Write a short observation").max(1000).safeParse(form.get("note"));
    if (!note.success) firstIssue(note.error.issues);
    const { token } = await requireActionRole(["teacher"]);
    await rpc("api_add_observation", { p_token: token, p_student: studentId, p_note: note.data, p_share: form.get("share") === "on" });
    return undefined;
  });
}
