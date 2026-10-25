"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Result = { ok: true; data: unknown } | { ok: false; error: string };

export interface RevealField { key: string; label: string }

function Reveal({ data, fields }: { data: unknown; fields: RevealField[] }) {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  const shown = fields.filter((f) => rec[f.key] !== undefined && rec[f.key] !== null && rec[f.key] !== "");
  if (shown.length === 0) return null;
  return (
    <dl className="mt-3 grid gap-2 rounded-2xl bg-sun-100 p-4 text-sm" data-testid="reveal">
      {shown.map((f) => (
        <div key={f.key}>
          <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{f.label}</dt>
          <dd className="font-mono text-base font-bold" data-testid={`reveal-${f.key}`}>{String(rec[f.key])}</dd>
        </div>
      ))}
      <p className="text-xs text-ink-700">Shown once. Share it with the family through a secure channel; it cannot be displayed again.</p>
    </dl>
  );
}

/** Submits a bound server action with the form's fields and shows the outcome. */
export function ActionForm({ action, children, submitLabel, successMessage = "Saved.", confirm, reveal = [], className = "", resetOnSuccess = false, submitClass = "btn-primary" }: {
  action: (form: FormData) => Promise<Result>;
  children?: React.ReactNode;
  submitLabel: string;
  successMessage?: string;
  confirm?: string;
  reveal?: RevealField[];
  className?: string;
  resetOnSuccess?: boolean;
  submitClass?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [asking, setAsking] = useState(false);

  const submit = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    start(async () => {
      const res = await action(data);
      setResult(res);
      if (res.ok) {
        if (resetOnSuccess) form.reset();
        router.refresh();
      }
    });
  };

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm) setAsking(true);
        else submit();
      }}
    >
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" className={`btn btn-sm ${submitClass}`} disabled={pending} aria-busy={pending}>{pending ? "Working…" : submitLabel}</button>
        {result && (
          <p role="status" className={`text-sm font-semibold ${result.ok ? "text-mint-700" : "text-coral-700"}`}>
            {result.ok ? successMessage : result.error}
          </p>
        )}
      </div>
      {result?.ok && <Reveal data={result.data} fields={reveal} />}
      {asking && (
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4">
          <div className="card max-w-sm p-6">
            <h2 id="confirm-title" className="text-xl font-bold">Please confirm</h2>
            <p className="mt-2 text-ink-700">{confirm}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAsking(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" data-testid="confirm-yes" onClick={() => { setAsking(false); submit(); }}>Yes, continue</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
