import Link from "next/link";
import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { enrolApplication, updateApplication } from "@/app/actions/admissions";
import { ActionForm } from "@/components/forms/ActionForm";
import { PageHeader, Panel, StatusBadge, formatDate, statusLabel } from "@/components/ui/ui";

interface Detail {
  id: string; reference: string; status: string; child_first_name: string; child_last_name: string; child_date_of_birth: string; requested_level: string;
  guardian_name: string; guardian_email: string; guardian_phone: string; emergency_contact_name: string | null; emergency_contact_phone: string | null;
  notes_from_family: string | null; decision_note: string | null; submitted_at: string; updated_at: string;
  documents: { id: string; file_name: string; mime_type: string; size_bytes: number }[];
  notes: { note: string; author: string | null; created_at: string }[];
  student: { id: string; name: string; student_code: string } | null;
  classes: { id: string; name: string; level: string }[];
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><dt className="text-xs font-bold uppercase text-ink-500">{k}</dt><dd>{v || "—"}</dd></div>;
}

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { token } = await requireRole(["admissions", "admin"]);
  let a: Detail;
  try { a = await rpc<Detail>("api_application_detail", { p_token: token, p_id: id }); }
  catch (e) { if (e instanceof ForbiddenError) notFound(); throw e; }

  const update = updateApplication.bind(null, a.id);
  const enrol = enrolApplication.bind(null, a.id);

  return (
    <>
      <p className="mb-2"><Link href="/admissions/dashboard" className="text-sm text-sky-700 underline">← All applications</Link></p>
      <PageHeader title={`${a.child_first_name} ${a.child_last_name}`} description={`${a.reference} · submitted ${formatDate(a.submitted_at)}`} actions={<StatusBadge status={a.status} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Application">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Row k="Date of birth" v={formatDate(a.child_date_of_birth)} /><Row k="Requested level" v={a.requested_level} />
              <Row k="Guardian" v={a.guardian_name} /><Row k="Email" v={a.guardian_email} /><Row k="Phone" v={a.guardian_phone} />
              <Row k="Emergency contact" v={a.emergency_contact_name && `${a.emergency_contact_name} (${a.emergency_contact_phone ?? ""})`} />
              <div className="sm:col-span-2"><Row k="Notes from family" v={a.notes_from_family} /></div>
            </dl>
          </Panel>
          <Panel title="Documents">
            {a.documents.length === 0 ? <p className="text-sm text-ink-500">No documents uploaded.</p> : (
              <ul className="space-y-2">{a.documents.map((d) => <li key={d.id}><a className="text-sky-700 underline" href={`/api/documents/${d.id}`}>{d.file_name}</a> <span className="text-xs text-ink-500">({Math.ceil(d.size_bytes / 1024)} KB)</span></li>)}</ul>
            )}
          </Panel>
          <Panel title="Internal notes">
            <ul className="mb-4 space-y-2">{a.notes.map((n, i) => <li key={i} className="rounded-xl bg-cream p-3 text-sm">{n.note}<div className="text-xs text-ink-500">{n.author} · {formatDate(n.created_at, true)}</div></li>)}</ul>
            <ActionForm action={update} submitLabel="Add note" successMessage="Note added." resetOnSuccess>
              <label className="label" htmlFor="note">New note</label><textarea id="note" name="note" className="input" rows={2} required />
            </ActionForm>
          </Panel>
        </div>
        <div className="space-y-6">
          {a.status !== "enrolled" && (
            <Panel title="Decision">
              <ActionForm action={update} submitLabel="Update status" successMessage="Status updated.">
                <label className="label" htmlFor="status">Status</label>
                <select id="status" name="status" className="input" defaultValue={a.status}>
                  {["submitted", "under_review", "information_required", "accepted", "rejected"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
                <label className="label mt-3" htmlFor="decision_note">Message to family (shown on status page when information is required)</label>
                <textarea id="decision_note" name="decision_note" className="input" rows={2} defaultValue={a.decision_note ?? ""} />
              </ActionForm>
            </Panel>
          )}
          {(a.status === "accepted" || a.status === "enrolled") && (
            <Panel title="Enrol">
              <p className="mb-3 text-sm">{a.status === "enrolled" ? "This application is enrolled. Running enrol again is safe and only shows the student code." : "Creates the student, a parent login and the class place. Credentials are shown once."}</p>
              <ActionForm action={enrol} submitLabel="Enrol student" confirm="Create the student and parent accounts now?" successMessage="Student enrolled."
                reveal={[{ key: "student_code", label: "Student code" }, { key: "initial_password", label: "Student password" }, { key: "parent_email", label: "Parent login email" }, { key: "parent_initial_password", label: "Parent password" }]}>
                <label className="label" htmlFor="class_id">Class</label>
                <select id="class_id" name="class_id" className="input" defaultValue="">
                  <option value="">No class yet</option>
                  {a.classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </ActionForm>
            </Panel>
          )}
          {a.student && (
            <Panel title="Enrolled">
              <p>{a.student.name}</p><p className="font-mono text-lg font-bold">{a.student.student_code}</p>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
