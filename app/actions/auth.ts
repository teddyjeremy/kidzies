"use server";

import { redirect } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { adultLoginSchema, passwordChangeSchema, studentLoginSchema } from "@/lib/validation";
import { clearSessionCookie, clientKey, getSessionToken, requireActionRole, setSessionCookie } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/roles";
import { check, dbMessage, firstIssue, run, type ActionResult } from "@/lib/actions";
import type { Role } from "@/types";

export interface LoginState {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

type LoginResponse = { ok: true; token: string; role: Role } | { ok: false; error: string };

const GENERIC = "That code or password didn't work. Please check and try again, or ask a grown-up for help.";
const GENERIC_ADULT = "Those details didn't match an active account. Check your email and password.";

async function finishLogin(res: LoginResponse, next: string | null, adult: boolean): Promise<LoginState> {
  if (!res.ok) {
    return { error: res.error === "rate_limited" ? dbMessage("rate_limited") : adult ? GENERIC_ADULT : GENERIC };
  }
  await setSessionCookie(res.token);
  redirect(safeNext(next, res.role));
}

export async function loginStudent(_prev: LoginState, form: FormData): Promise<LoginState> {
  const raw = { code: String(form.get("code") ?? ""), password: String(form.get("password") ?? "") };
  const parsed = studentLoginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors, values: { code: raw.code } };
  }
  let res: LoginResponse;
  try {
    res = await rpc<LoginResponse>("api_login", {
      p_kind: "student", p_identifier: parsed.data.code, p_password: parsed.data.password, p_client: await clientKey(),
    });
  } catch {
    return { error: "We couldn't reach Kidzies right now. Please try again soon.", values: { code: raw.code } };
  }
  const state = await finishLogin(res, String(form.get("next") ?? "") || null, false);
  return { ...state, values: { code: raw.code } };
}

export async function loginAdult(_prev: LoginState, form: FormData): Promise<LoginState> {
  const raw = { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") };
  const parsed = adultLoginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors, values: { email: raw.email } };
  }
  let res: LoginResponse;
  try {
    res = await rpc<LoginResponse>("api_login", {
      p_kind: "adult", p_identifier: parsed.data.email, p_password: parsed.data.password, p_client: await clientKey(),
    });
  } catch {
    return { error: "We couldn't reach Kidzies right now. Please try again soon.", values: { email: raw.email } };
  }
  const state = await finishLogin(res, String(form.get("next") ?? "") || null, true);
  return { ...state, values: { email: raw.email } };
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await rpc("api_logout", { p_token: token });
    } catch {
      /* The cookie is cleared regardless. */
    }
  }
  await clearSessionCookie();
  redirect("/login?signedOut=1");
}

export async function changePassword(input: { current: string; next: string; confirm: string }): Promise<ActionResult> {
  return run(async () => {
    const parsed = passwordChangeSchema.safeParse(input);
    if (!parsed.success) firstIssue(parsed.error.issues);
    const { token } = await requireActionRole(["parent", "teacher", "admin", "admissions", "student"]);
    const res = await rpc<{ ok: boolean; error?: string }>("api_change_password", {
      p_token: token, p_current: parsed.data.current, p_new: parsed.data.next,
    });
    check(res);
    return undefined;
  });
}

export async function setSound(enabled: boolean): Promise<void> {
  const token = await getSessionToken();
  if (!token) return;
  try {
    await rpc("api_set_sound", { p_token: token, p_enabled: enabled });
  } catch {
    /* Preference also lives in the browser. */
  }
}
