"use server";

import { z } from "zod";
import { rpc } from "@/lib/db/rpc";
import { requireActionRole } from "@/lib/auth/session";
import { firstIssue, run, type ActionResult } from "@/lib/actions";
import { changePassword } from "@/app/actions/auth";

export async function updatePhone(form: FormData): Promise<ActionResult> {
  return run(async () => {
    const phone = z.string().trim().regex(/^[0-9+()\s-]{6,24}$/, "Please enter a valid phone number").safeParse(form.get("phone"));
    if (!phone.success) firstIssue(phone.error.issues);
    const { token } = await requireActionRole(["parent"]);
    await rpc("api_parent_update_phone", { p_token: token, p_phone: phone.data });
    return undefined;
  });
}

export async function changePasswordForm(form: FormData): Promise<ActionResult> {
  return changePassword({ current: String(form.get("current") ?? ""), next: String(form.get("next") ?? ""), confirm: String(form.get("confirm") ?? "") });
}
