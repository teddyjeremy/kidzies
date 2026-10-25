import { requireRole } from "@/lib/auth/session";
import { adminList } from "@/lib/db/admin";
import { assignTeacher, createClass } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/ActionForm";
import { Empty, PageHeader, Panel, TableWrap, Td, Th } from "@/components/ui/ui";

export const metadata = { title: "Classes" };

export default async function AdminClasses() {
  const { token } = await requireRole(["admin"]);
  const [classes, teachers] = await Promise.all([adminList(token, "classes"), adminList(token, "teachers")]);
  return (
    <>
      <PageHeader title="Classes" />
      <Panel title="Add a class" className="mb-6">
        <ActionForm action={createClass} submitLabel="Create class" successMessage="Class created." resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Class name</label><input id="name" name="name" className="input" required placeholder="Rainbow Class" /></div>
            <div><label className="label" htmlFor="level">Level</label><select id="level" name="level" className="input" defaultValue="KG1"><option>Pre-K</option><option>KG1</option><option>KG2</option></select></div>
          </div>
        </ActionForm>
      </Panel>
      {classes.length === 0 ? <Empty title="No classes yet" /> : (
        <TableWrap>
          <thead><tr><Th>Class</Th><Th>Level</Th><Th>Year</Th><Th>Students</Th><Th>Teachers</Th><Th>Assign teacher</Th></tr></thead>
          <tbody>{classes.map((c) => (
            <tr key={c.id}>
              <Td><strong>{c.name}</strong></Td><Td>{c.level}</Td><Td>{c.school_year}</Td><Td>{c.student_count}</Td>
              <Td>{c.teachers.map((t) => t.name).join(", ") || "—"}</Td>
              <Td><ActionForm action={assignTeacher.bind(null, c.id)} submitLabel="Assign" submitClass="btn-secondary btn-sm" successMessage="Teacher assigned.">
                <select name="teacher_id" aria-label="Teacher" className="input" required defaultValue="">{[<option key="" value="" disabled>Teacher</option>, ...teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)]}</select>
              </ActionForm></Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}
    </>
  );
}
