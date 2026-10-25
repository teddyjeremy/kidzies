"use client";

import { useState, useTransition } from "react";
import { checkStatus, type StatusResult } from "@/app/actions/admissions";

const LABEL: Record<string, string> = { submitted: "Submitted", under_review: "Under review", information_required: "More information needed", accepted: "Accepted", rejected: "Not offered a place", enrolled: "Enrolled" };

export function StatusForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);
  return (
    <div className="space-y-6">
      <form className="card grid gap-4 p-6 sm:grid-cols-2" onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await checkStatus(data);
          if (res.ok) setResult(res.data); else { setResult(null); setError(res.error); }
        });
      }}>
        <div><label className="label" htmlFor="reference">Reference number</label><input className="input font-mono uppercase" id="reference" name="reference" placeholder="KZ-2026-AB12CD" required /></div>
        <div><label className="label" htmlFor="email">Guardian email</label><input className="input" type="email" id="email" name="email" required /></div>
        <div className="sm:col-span-2"><button className="btn btn-primary" disabled={pending}>{pending ? "Checking…" : "Check status"}</button></div>
        {error && <p role="alert" className="sm:col-span-2 rounded-2xl bg-coral-100 p-3 text-sm font-bold text-coral-700">{error}</p>}
      </form>
      {result && (
        <div className="card p-6" role="status">
          <p className="text-sm text-ink-500">{result.reference} · {result.child_first_name} · {result.requested_level}</p>
          <p className="mt-1 text-3xl font-bold" data-testid="application-status">{LABEL[result.status] ?? result.status}</p>
          {result.message && <p className="mt-3 rounded-2xl bg-sun-100 p-3">{result.message}</p>}
          <p className="mt-3 text-xs text-ink-500">Last updated {new Date(result.updated_at).toLocaleDateString("en-GB")}</p>
        </div>
      )}
    </div>
  );
}
