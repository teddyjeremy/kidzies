import Link from "next/link";
import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { addObservation, giveFeedback } from "@/app/actions/teacher";
import { ActionForm } from "@/components/forms/ActionForm";
import { ChildReport } from "@/components/portal/ChildReport";
import { PageHeader, Panel } from "@/components/ui/ui";
import type { ChildSummary } from "@/types";

type TeacherStudent = ChildSummary & { guardians: { name: string; email: string; phone: string | null; relationship: string }[] };

export default async function TeacherStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { token } = await requireRole(["teacher"]);
  let s: TeacherStudent;
  try {
    s = await rpc<TeacherStudent>("api_teacher_student", { p_token: token, p_student: id });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader title={`${s.first_name} ${s.last_name}`} description={`${s.level} · ${s.classes.map((c) => c.name).join(", ")}`}
        actions={<Link href={`/teacher/assignments?student=${s.id}`} className="btn btn-primary btn-sm">Assign activity</Link>} />
      <ChildReport child={s} feedbackSlot={(attemptId, existing) => (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-bold text-sky-700">{existing ? "Edit feedback" : "Give feedback"}</summary>
          <ActionForm action={giveFeedback.bind(null, attemptId)} submitLabel="Save feedback" successMessage="Feedback saved">
            <label className="sr-only" htmlFor={`fb-${attemptId}`}>Feedback</label>
            <textarea id={`fb-${attemptId}`} name="feedback" defaultValue={existing ?? ""} rows={2} className="input mt-2" required />
          </ActionForm>
        </details>
      )} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Parent / guardian contacts">
          {s.guardians.length === 0 ? <p className="text-sm text-ink-500">No guardians linked.</p> : (
            <ul className="space-y-2 text-sm">{s.guardians.map((g) => <li key={g.email}><strong>{g.name}</strong> ({g.relationship}) · <a className="text-sky-700 underline" href={`mailto:${g.email}`}>{g.email}</a>{g.phone && ` · ${g.phone}`}</li>)}</ul>
          )}
        </Panel>
        <Panel title="Add a learning observation">
          <ActionForm action={addObservation.bind(null, s.id)} submitLabel="Save observation" successMessage="Observation saved" resetOnSuccess>
            <label htmlFor="obs" className="sr-only">Observation</label>
            <textarea id="obs" name="note" rows={3} className="input" placeholder="e.g. Counted to 10 confidently today" required />
            <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="share" defaultChecked className="size-4" /> Share with the family</label>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
