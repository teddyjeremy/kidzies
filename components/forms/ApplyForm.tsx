"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitApplication } from "@/app/actions/admissions";
import { CopyButton } from "@/components/ui/CopyButton";

export function ApplyForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  if (reference) {
    return (
      <div className="card bg-mint-100 p-8 text-center" role="status">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-2 text-2xl font-bold">Application received</h2>
        <p className="mt-2">Your reference number is</p>
        <p className="mt-1 font-mono text-3xl font-bold" data-testid="application-reference">{reference}</p>
        <div className="mt-3 flex justify-center"><CopyButton value={reference} label="Copy reference" /></div>
        <p className="mt-4 text-sm text-ink-700">Keep it safe. Use it with your email to check progress.</p>
        <Link href="/admissions/status" className="btn btn-primary mt-6">Check status</Link>
      </div>
    );
  }

  return (
    <form
      className="card space-y-6 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await submitApplication(data);
          if (res.ok) setReference(res.data.reference);
          else setError(res.error);
        });
      }}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-xl font-bold">About your child</legend>
        <div><label className="label" htmlFor="child_first_name">First name</label><input className="input" id="child_first_name" name="child_first_name" required /></div>
        <div><label className="label" htmlFor="child_last_name">Last name</label><input className="input" id="child_last_name" name="child_last_name" required /></div>
        <div><label className="label" htmlFor="child_date_of_birth">Date of birth</label><input className="input" type="date" id="child_date_of_birth" name="child_date_of_birth" required /></div>
        <div><label className="label" htmlFor="requested_level">Requested level</label>
          <select className="input" id="requested_level" name="requested_level" defaultValue="KG1"><option>Pre-K</option><option>KG1</option><option>KG2</option></select></div>
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-xl font-bold">Parent or guardian</legend>
        <div className="sm:col-span-2"><label className="label" htmlFor="guardian_name">Full name</label><input className="input" id="guardian_name" name="guardian_name" required /></div>
        <div><label className="label" htmlFor="guardian_email">Email</label><input className="input" type="email" id="guardian_email" name="guardian_email" required /></div>
        <div><label className="label" htmlFor="guardian_phone">Phone</label><input className="input" id="guardian_phone" name="guardian_phone" required /></div>
        <div><label className="label" htmlFor="emergency_contact_name">Emergency contact (optional)</label><input className="input" id="emergency_contact_name" name="emergency_contact_name" /></div>
        <div><label className="label" htmlFor="emergency_contact_phone">Emergency phone (optional)</label><input className="input" id="emergency_contact_phone" name="emergency_contact_phone" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="notes_from_family">Anything we should know? (optional)</label><textarea className="input" rows={3} maxLength={1000} id="notes_from_family" name="notes_from_family" /></div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xl font-bold">Documents (optional)</legend>
        <input type="file" name="documents" multiple accept="application/pdf,image/png,image/jpeg" aria-label="Documents" className="block text-sm" />
        <p className="mt-1 text-xs text-ink-500">PDF, PNG or JPEG, up to 2 MB each, three files at most.</p>
      </fieldset>
      <div className="space-y-2">
        <label className="flex items-start gap-2"><input type="checkbox" name="consent_data" className="mt-1 h-5 w-5" required /> I consent to the school processing this information for admissions.</label>
        <label className="flex items-start gap-2"><input type="checkbox" name="consent_terms" className="mt-1 h-5 w-5" required /> I accept the <Link href="/terms" className="underline">admissions terms</Link>.</label>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-coral-100 p-3 text-sm font-bold text-coral-700">{error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Submit application"}</button>
    </form>
  );
}
