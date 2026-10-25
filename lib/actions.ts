import "server-only";
import { friendlyError, UserError, ValidationError } from "@/lib/db/errors";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof Error && (error.message === "unauthorized" || error.message === "forbidden")) {
      return { ok: false, error: error.message === "forbidden" ? "You do not have permission to do that." : "Your session has ended. Please sign in again." };
    }
    if (!(error instanceof ValidationError) && !(error instanceof UserError)) console.error("[kidzies] action failed", error instanceof Error ? error.message : error);
    return { ok: false, error: friendlyError(error) };
  }
}

/** Maps database error codes returned in `{ ok: false, error }` payloads to friendly text. */
export const DB_MESSAGES: Record<string, string> = {
  demo_restricted: "This is a protected demonstration record, so this action is switched off in the public demo.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  email_exists: "An account with that email already exists.",
  not_accepted: "Only accepted applications can be enrolled.",
  already_enrolled: "This application has already been enrolled.",
  invalid_status: "That status change is not allowed.",
  invalid_current: "Your current password is not correct.",
  weak: "Please choose a longer password (at least 10 characters).",
  consent_required: "Please tick both consent boxes.",
  too_many_documents: "Please upload up to three documents.",
  not_found: "We could not find an application with that reference and email.",
};

export function dbMessage(code: string | undefined): string {
  return (code && DB_MESSAGES[code]) || "Something went wrong. Please try again.";
}

/** Throws a user-facing error when a database payload reports `{ ok: false }`. */
export function check<T extends { ok: boolean; error?: string }>(res: T): T {
  if (!res.ok) throw new UserError(dbMessage(res.error));
  return res;
}

export function firstIssue(issues: { message: string }[]): never {
  throw new UserError(issues[0]?.message ?? "Please check the form.");
}
