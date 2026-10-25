"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { rpc } from "@/lib/db/rpc";
import { requireActionRole } from "@/lib/auth/session";
import { firstIssue, run, type ActionResult } from "@/lib/actions";
import { AREAS } from "@/lib/validation";
import type { AttemptResult } from "@/types";

const attemptSchema = z.object({
  area: z.enum(AREAS),
  assignmentId: z.string().uuid().nullable(),
  score: z.number().int().min(0).max(50),
  max: z.number().int().min(1).max(50),
  answers: z.array(z.union([z.string().max(200), z.number(), z.record(z.string(), z.string().max(40))])).max(100),
  mistakes: z.array(z.string().max(200)).max(100),
  durationSeconds: z.number().int().min(0).max(7200),
});

export type AttemptInput = z.infer<typeof attemptSchema>;

export async function recordAttempt(input: AttemptInput): Promise<ActionResult<AttemptResult>> {
  return run(async () => {
    const parsed = attemptSchema.safeParse(input);
    if (!parsed.success) firstIssue(parsed.error.issues);
    const { token } = await requireActionRole(["student"]);
    const d = parsed.data;
    const result = await rpc<AttemptResult>("api_record_attempt", {
      p_token: token, p_area: d.area, p_assignment: d.assignmentId, p_score: Math.min(d.score, d.max), p_max: d.max,
      p_answers: d.answers, p_mistakes: d.mistakes, p_duration: d.durationSeconds,
    });
    revalidatePath("/playground");
    return result;
  });
}
