import { z } from "zod";

export const STUDENT_CODE_RE = /^[A-Z0-9]{8}$/;

export function normaliseStudentCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, "");
}

export const studentLoginSchema = z.object({
  code: z
    .string()
    .transform(normaliseStudentCode)
    .refine((v) => STUDENT_CODE_RE.test(v), { message: "Your code has 8 letters and numbers, like QF5G7J90." }),
  password: z.string().min(1, "Please type your password.").max(200),
});

export const adultLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password.").max(200),
});

export const LEVELS = ["Pre-K", "KG1", "KG2"] as const;
export const AREAS = [
  "abc-garden",
  "number-playground",
  "animal-world",
  "storytime",
  "shapes-colours",
  "creative-studio",
  "life-skills",
] as const;
export const ACTIVITY_TYPES = ["multiple_choice", "matching", "counting", "letter", "shape", "colour"] as const;
export const SUBJECTS = ["literacy", "numeracy", "shapes", "science", "creative-arts", "social-emotional", "life-skills"] as const;

const phone = z.string().trim().regex(/^[0-9+()\s-]{6,24}$/, "Please enter a valid phone number.");

export const applicationSchema = z.object({
  child_first_name: z.string().trim().min(1, "Required").max(60),
  child_last_name: z.string().trim().min(1, "Required").max(60),
  child_date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
    .refine((v) => {
      const d = new Date(v);
      const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= 2 && age <= 7.5;
    }, "Kidzies programmes are for children aged 2–7."),
  requested_level: z.enum(LEVELS),
  guardian_name: z.string().trim().min(2, "Required").max(100),
  guardian_email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  guardian_phone: phone,
  emergency_contact_name: z.string().trim().max(100).optional().or(z.literal("")),
  emergency_contact_phone: z.union([phone, z.literal("")]).optional(),
  notes_from_family: z.string().trim().max(1000).optional().or(z.literal("")),
  consent_data: z.literal(true, { message: "Please confirm consent to process this information." }),
  consent_terms: z.literal(true, { message: "Please accept the admissions terms." }),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const ALLOWED_DOC_TYPES = ["application/pdf", "image/png", "image/jpeg"] as const;
export const MAX_DOC_BYTES = 2 * 1024 * 1024;

export const statusCheckSchema = z.object({
  reference: z.string().trim().toUpperCase().regex(/^KZ-\d{4}-[A-Z0-9]{6}$/, "References look like KZ-2026-AB12CD."),
  email: z.string().trim().toLowerCase().email("Please enter the email used on the application."),
});

export const questionSchema = z.object({
  prompt: z.string().trim().min(2, "Add a question").max(200),
  emoji: z.string().trim().max(8).optional().or(z.literal("")),
  options: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  answer: z.string().trim().max(40).optional().or(z.literal("")),
  object: z.string().trim().max(20).optional().or(z.literal("")),
  target: z.string().trim().max(2).optional().or(z.literal("")),
});

export const lessonSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    title: z.string().trim().min(3, "At least 3 characters").max(120),
    subject: z.enum(SUBJECTS),
    level: z.enum(LEVELS),
    description: z.string().trim().max(1000),
    objectives: z.array(z.string().trim().min(1).max(200)).max(8),
    instructions: z.string().trim().max(1000),
    activity_type: z.enum(ACTIVITY_TYPES),
    location: z.enum(AREAS),
    media_url: z.union([z.string().trim().url().startsWith("https://"), z.literal("")]).optional(),
    questions: z.array(questionSchema).min(1, "Add at least one question").max(20),
    points_per_question: z.coerce.number().int().min(1).max(10),
    pass_mark: z.coerce.number().int().min(0).max(100),
    status: z.enum(["draft", "published", "archived"]),
  })
  .superRefine((lesson, ctx) => {
    lesson.questions.forEach((q, i) => {
      if (lesson.activity_type === "counting") {
        const n = Number(q.target);
        if (!Number.isInteger(n) || n < 1 || n > 10) {
          ctx.addIssue({ code: "custom", path: ["questions", i, "target"], message: "Choose a number from 1 to 10" });
        }
      } else {
        const opts = q.options ?? [];
        if (opts.length < 2) ctx.addIssue({ code: "custom", path: ["questions", i, "options"], message: "Add at least two options" });
        if (!q.answer || !opts.includes(q.answer)) {
          ctx.addIssue({ code: "custom", path: ["questions", i, "answer"], message: "The correct answer must be one of the options" });
        }
      }
    });
  });
export type LessonInput = z.input<typeof lessonSchema>;

export const assignmentSchema = z
  .object({
    lesson_id: z.string().uuid("Choose a lesson"),
    target: z.string().regex(/^(class|student):[0-9a-f-]{36}$/, "Choose a class or a student"),
    due_at: z.string().optional().or(z.literal("")),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  });

export const newStudentSchema = z.object({
  first_name: z.string().trim().min(1, "Required").max(60),
  last_name: z.string().trim().min(1, "Required").max(60),
  nickname: z.string().trim().max(30).optional().or(z.literal("")),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  level: z.enum(LEVELS),
  class_id: z.string().uuid().optional().or(z.literal("")),
  guardian_id: z.string().uuid().optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(10, "Use at least 10 characters").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
