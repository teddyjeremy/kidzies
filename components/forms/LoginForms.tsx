"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, GraduationCap, Users } from "lucide-react";
import { loginAdult, loginStudent, type LoginState } from "@/app/actions/auth";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full text-lg" disabled={pending} aria-busy={pending}>
      {pending ? "Signing in…" : children}
    </button>
  );
}

function PasswordField({ error, defaultValue }: { error?: string; defaultValue?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor="password" className="label">Password</label>
      <div className="relative">
        <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" className="input pr-14" required
          defaultValue={defaultValue} aria-invalid={Boolean(error)} aria-describedby={error ? "password-error" : undefined} />
        <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-ink-500 hover:bg-sky-100"
          aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p id="password-error" className="mt-1 text-sm font-semibold text-coral-700">{error}</p>}
    </div>
  );
}

function FormError({ state }: { state: LoginState }) {
  if (!state.error) return null;
  return <p role="alert" className="rounded-2xl bg-coral-50 p-3 text-sm font-semibold text-coral-700">{state.error}</p>;
}

export function LoginForms({ initialType, initialId, demo, next }: { initialType: "student" | "adult"; initialId: string; demo: boolean; next: string }) {
  const [type, setType] = useState(initialType);
  const [studentState, studentAction] = useActionState(loginStudent, {});
  const [adultState, adultAction] = useActionState(loginAdult, {});
  const demoPw = demo ? "KidziesDemo123!" : undefined;

  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <div role="tablist" aria-label="Who is signing in?" className="grid grid-cols-2 gap-2 rounded-2xl bg-cream p-1.5">
        <button type="button" role="tab" id="tab-student" aria-selected={type === "student"} aria-controls="panel-student" onClick={() => setType("student")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-display font-bold ${type === "student" ? "bg-white text-coral-600 shadow-sm" : "text-ink-500"}`}>
          <GraduationCap size={20} aria-hidden="true" /> Student
        </button>
        <button type="button" role="tab" id="tab-adult" aria-selected={type === "adult"} aria-controls="panel-adult" onClick={() => setType("adult")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-display font-bold ${type === "adult" ? "bg-white text-sky-700 shadow-sm" : "text-ink-500"}`}>
          <Users size={20} aria-hidden="true" /> Parent &amp; staff
        </button>
      </div>

      {demo && (
        <p className="mt-4 rounded-2xl bg-sun-100 p-3 text-sm font-semibold">
          You are signing in to a <strong>demo account</strong>. The demo password is filled in for you.
        </p>
      )}

      {type === "student" ? (
        <form id="panel-student" role="tabpanel" aria-labelledby="tab-student" action={studentAction} className="mt-6 space-y-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="code" className="label">Student code</label>
            <input id="code" name="code" autoComplete="username" autoCapitalize="characters" spellCheck={false} inputMode="text" maxLength={12}
              placeholder="e.g. QF5G7J90" className="input font-mono text-2xl uppercase tracking-[0.2em]"
              defaultValue={studentState.values?.code ?? (initialType === "student" ? initialId : "")}
              aria-invalid={Boolean(studentState.fieldErrors?.code)} aria-describedby="code-help" required />
            <p id="code-help" className={`mt-1 text-sm ${studentState.fieldErrors?.code ? "font-semibold text-coral-700" : "text-ink-500"}`}>
              {studentState.fieldErrors?.code ?? "8 letters and numbers from your school."}
            </p>
          </div>
          <PasswordField error={studentState.fieldErrors?.password} defaultValue={initialType === "student" ? demoPw : undefined} />
          <FormError state={studentState} />
          <Submit>Let&apos;s play! 🚀</Submit>
          <p className="rounded-2xl bg-sky-100 p-3 text-sm text-ink-700">
            <strong>Need help signing in?</strong> Ask your parent or grown-up to contact your school. They can reset your password.
          </p>
        </form>
      ) : (
        <form id="panel-adult" role="tabpanel" aria-labelledby="tab-adult" action={adultAction} className="mt-6 space-y-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" className="input" required
              defaultValue={adultState.values?.email ?? (initialType === "adult" ? initialId : "")}
              aria-invalid={Boolean(adultState.fieldErrors?.email)} aria-describedby={adultState.fieldErrors?.email ? "email-error" : undefined} />
            {adultState.fieldErrors?.email && <p id="email-error" className="mt-1 text-sm font-semibold text-coral-700">{adultState.fieldErrors.email}</p>}
          </div>
          <PasswordField error={adultState.fieldErrors?.password} defaultValue={initialType === "adult" ? demoPw : undefined} />
          <FormError state={adultState} />
          <Submit>Sign in</Submit>
          <p className="text-sm text-ink-500">
            Parents, teachers, administrators and admissions staff sign in here. You will be taken to your own portal automatically.
            Forgotten your password? Contact the school office.
          </p>
        </form>
      )}
    </div>
  );
}
