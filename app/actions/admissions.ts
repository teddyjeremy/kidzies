"use server";

import { z } from "zod";
import { rpc } from "@/lib/db/rpc";
import { clientKey, requireActionRole } from "@/lib/auth/session";
import { check, firstIssue, run, type ActionResult } from "@/lib/actions";
import { ALLOWED_DOC_TYPES, MAX_DOC_BYTES, applicationSchema, statusCheckSchema } from "@/lib/validation";
import { UserError } from "@/lib/db/errors";

const ROLES = ["admissions", "admin"] as const;
const uuid = z.string().uuid();

function sniff(bytes: Uint8Array): string | null {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "application/pdf";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

export async function submitApplication(form: FormData): Promise<ActionResult<{ reference: string }>> {
  return run(async () => {
    const raw = Object.fromEntries(["child_first_name", "child_last_name", "child_date_of_birth", "requested_level", "guardian_name", "guardian_email", "guardian_phone", "emergency_contact_name", "emergency_contact_phone", "notes_from_family"].map((k) => [k, String(form.get(k) ?? "")]));
    const parsed = applicationSchema.safeParse({ ...raw, consent_data: form.get("consent_data") === "on", consent_terms: form.get("consent_terms") === "on" });
    if (!parsed.success) firstIssue(parsed.error.issues);
    const files = form.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > 3) throw new UserError("Please upload up to three documents.");
    const documents = [];
    for (const f of files) {
      if (f.size > MAX_DOC_BYTES) throw new UserError(`${f.name} is larger than 2 MB.`);
      const bytes = new Uint8Array(await f.arrayBuffer());
      const type = sniff(bytes);
      if (!type || !(ALLOWED_DOC_TYPES as readonly string[]).includes(type)) throw new UserError(`${f.name} must be a PDF, PNG or JPEG file.`);
      documents.push({ file_name: f.name, mime_type: type, data_base64: Buffer.from(bytes).toString("base64") });
    }
    const res = check(await rpc<{ ok: boolean; error?: string; reference: string }>("api_submit_application", { p_app: parsed.data, p_documents: documents, p_client: await clientKey() }));
    return { reference: res.reference };
  });
}

export interface StatusResult { reference: string; status: string; child_first_name: string; requested_level: string; submitted_at: string; updated_at: string; message: string | null }

export async function checkStatus(form: FormData): Promise<ActionResult<StatusResult>> {
  return run(async () => {
    const parsed = statusCheckSchema.safeParse({ reference: form.get("reference"), email: form.get("email") });
    if (!parsed.success) firstIssue(parsed.error.issues);
    const res = check(await rpc<StatusResult & { ok: boolean; error?: string }>("api_application_status", { p_reference: parsed.data.reference, p_email: parsed.data.email, p_client: await clientKey() }));
    return { reference: res.reference, status: res.status, child_first_name: res.child_first_name, requested_level: res.requested_level, submitted_at: res.submitted_at, updated_at: res.updated_at, message: res.message };
  });
}

const STATUSES = ["submitted", "under_review", "information_required", "accepted", "rejected"] as const;

export async function updateApplication(id: string, form: FormData): Promise<ActionResult> {
  return run(async () => {
    const parsed = z.object({
      id: uuid,
      status: z.enum(STATUSES).optional().or(z.literal("")),
      note: z.string().trim().max(2000).optional(),
      decision_note: z.string().trim().max(1000).optional(),
    }).safeParse({ id, status: form.get("status") ?? "", note: form.get("note") ?? "", decision_note: form.get("decision_note") ?? "" });
    if (!parsed.success) firstIssue(parsed.error.issues);
    if (parsed.data.status === "information_required" && !parsed.data.decision_note) throw new UserError("Please tell the family what information is needed.");
    const { token } = await requireActionRole([...ROLES]);
    check(await rpc<{ ok: boolean; error?: string }>("api_update_application", { p_token: token, p_id: id, p_status: parsed.data.status || null, p_note: parsed.data.note || null, p_decision_note: parsed.data.decision_note || null }));
    return undefined;
  });
}

export interface EnrolResult { already_enrolled: boolean; student_code: string; initial_password?: string; parent_email?: string; parent_initial_password?: string | null }

export async function enrolApplication(id: string, form: FormData): Promise<ActionResult<EnrolResult>> {
  return run(async () => {
    const cls = String(form.get("class_id") ?? "");
    if (!uuid.safeParse(id).success || (cls && !uuid.safeParse(cls).success)) throw new UserError("Please choose a class.");
    const { token } = await requireActionRole([...ROLES]);
    const res = check(await rpc<EnrolResult & { ok: boolean; error?: string }>("api_enrol_application", { p_token: token, p_id: id, p_class: cls || null }));
    const { ok: _ok, error: _e, ...rest } = res;
    return rest;
  });
}
