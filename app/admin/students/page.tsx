import { requireRole } from "@/lib/auth/session";
import { adminList } from "@/lib/db/admin";
import { createStudent, enrolStudent, setAccountStatus, studentCredentials } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/ActionForm";
import { SearchBox } from "@/components/portal/SearchBox";
import { Badge, Empty, PageHeader, Panel, StatusBadge, TableWrap, Td, Th, relative } from "@/components/ui/ui";

export const metadata = { title: "Students" };
const CREDS = [{ key: "student_code", label: "Student code" }, { key: "initial_password", label: "Temporary password" }];

export default async function AdminStudents({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { token } = await requireRole(["admin"]);
  const [students, classes, guardians] = await Promise.all([adminList(token, "students", q), adminList(token, "classes"), adminList(token, "guardians")]);
  return (
    <>
      <PageHeader title="Students" description="Create accounts, reset passwords, issue new codes and manage class places." />
      <Panel title="Add a student" className="mb-6">
        <ActionForm action={createStudent} submitLabel="Create student" successMessage="Student created." reveal={CREDS} resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label" htmlFor="first_name">First name</label><input id="first_name" name="first_name" className="input" required /></div>
            <div><label className="label" htmlFor="last_name">Last name</label><input id="last_name" name="last_name" className="input" required /></div>
            <div><label className="label" htmlFor="nickname">Nickname (optional)</label><input id="nickname" name="nickname" className="input" /></div>
            <div><label className="label" htmlFor="date_of_birth">Date of birth</label><input id="date_of_birth" type="date" name="date_of_birth" className="input" /></div>
            <div><label className="label" htmlFor="level">Level</label><select id="level" name="level" className="input" defaultValue="KG1"><option>Pre-K</option><option>KG1</option><option>KG2</option></select></div>
            <div><label className="label" htmlFor="class_id">Class</label><select id="class_id" name="class_id" className="input" defaultValue=""><option value="">None</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label" htmlFor="guardian_id">Guardian</label><select id="guardian_id" name="guardian_id" className="input" defaultValue=""><option value="">None</option>{guardians.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          </div>
        </ActionForm>
      </Panel>
      <SearchBox q={q} placeholder="Search name or code" />
      {students.length === 0 ? <Empty title="No students found" /> : (
        <TableWrap>
          <thead><tr><Th>Student</Th><Th>Code</Th><Th>Class</Th><Th>Guardians</Th><Th>Status</Th><Th>Last sign-in</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} data-testid="student-row">
                <Td><strong>{s.first_name} {s.last_name}</strong><div className="text-xs text-ink-500">{s.level}</div></Td>
                <Td><span className="font-mono">{s.student_code ?? "—"}</span>{s.protected && <div><Badge tone="yellow">Demo · protected</Badge></div>}</Td>
                <Td>{s.classes.map((c) => c.name).join(", ") || "—"}</Td>
                <Td>{s.guardians.map((g) => g.name).join(", ") || "—"}</Td>
                <Td>{s.status ? <StatusBadge status={s.status} /> : <Badge>No login</Badge>}</Td>
                <Td>{relative(s.last_login_at)}</Td>
                <Td>
                  {s.protected ? <span className="text-xs text-ink-500">Locked for the public demo</span> : (
                    <details>
                      <summary className="cursor-pointer text-sm font-bold text-sky-700">Manage</summary>
                      <div className="mt-2 w-64 space-y-3">
                        {s.account_id ? (
                          <>
                            <ActionForm action={studentCredentials.bind(null, s.id, "reset_password")} submitLabel="Reset password" submitClass="btn-secondary btn-sm" confirm={`Reset ${s.first_name}'s password? They will be signed out.`} reveal={CREDS} successMessage="Password reset." />
                            <ActionForm action={studentCredentials.bind(null, s.id, "regenerate_code")} submitLabel="New student code" submitClass="btn-secondary btn-sm" confirm="Issue a new code? The old code stops working." reveal={CREDS} successMessage="New code issued." />
                            {s.status === "suspended"
                              ? <ActionForm action={setAccountStatus.bind(null, s.account_id, "active")} submitLabel="Reactivate" submitClass="btn-secondary btn-sm" successMessage="Reactivated." />
                              : <ActionForm action={setAccountStatus.bind(null, s.account_id, "suspended")} submitLabel="Suspend" submitClass="btn-danger btn-sm" confirm="Suspend this account? The child will be signed out." successMessage="Suspended." />}
                          </>
                        ) : <ActionForm action={studentCredentials.bind(null, s.id, "activate")} submitLabel="Create login" submitClass="btn-secondary btn-sm" reveal={CREDS} successMessage="Login created." />}
                        <ActionForm action={enrolStudent.bind(null, s.id)} submitLabel="Add to class" submitClass="btn-secondary btn-sm" successMessage="Added to class.">
                          <select name="class_id" aria-label="Class" className="input" required defaultValue="">{[<option key="" value="" disabled>Choose class</option>, ...classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)]}</select>
                        </ActionForm>
                      </div>
                    </details>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
