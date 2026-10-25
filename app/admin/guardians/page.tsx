import { requireRole } from "@/lib/auth/session";
import { adminList } from "@/lib/db/admin";
import { createGuardian, linkGuardian } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/ActionForm";
import { SearchBox } from "@/components/portal/SearchBox";
import { Badge, Empty, PageHeader, Panel, TableWrap, Td, Th } from "@/components/ui/ui";

export const metadata = { title: "Parents & guardians" };

export default async function AdminGuardians({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { token } = await requireRole(["admin"]);
  const [guardians, students] = await Promise.all([adminList(token, "guardians", q), adminList(token, "students")]);
  const studentOptions = students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>);
  return (
    <>
      <PageHeader title="Parents & guardians" description="A parent login only ever sees children linked here." />
      <Panel title="Add a guardian" className="mb-6">
        <ActionForm action={createGuardian} submitLabel="Create guardian login" successMessage="Guardian created." reveal={[{ key: "initial_password", label: "Temporary password" }]} resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" className="input" required /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" required /></div>
            <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" className="input" /></div>
            <div><label className="label" htmlFor="student_id">Link to child</label><select id="student_id" name="student_id" className="input" defaultValue=""><option value="">Later</option>{studentOptions}</select></div>
            <div><label className="label" htmlFor="relationship">Relationship</label><input id="relationship" name="relationship" className="input" placeholder="Mother, Father, Guardian…" /></div>
          </div>
        </ActionForm>
      </Panel>
      <SearchBox q={q} placeholder="Search name or email" />
      {guardians.length === 0 ? <Empty title="No guardians found" /> : (
        <TableWrap>
          <thead><tr><Th>Name</Th><Th>Contact</Th><Th>Children</Th><Th>Login</Th><Th>Link child</Th></tr></thead>
          <tbody>{guardians.map((g) => (
            <tr key={g.id}>
              <Td><strong>{g.name}</strong></Td>
              <Td>{g.email}<div className="text-xs text-ink-500">{g.phone}</div></Td>
              <Td>{g.children.map((c) => `${c.name} (${c.relationship})`).join(", ") || "—"}</Td>
              <Td>{g.has_login ? <Badge tone="green">{g.account_status}</Badge> : <Badge>None</Badge>}</Td>
              <Td>
                <ActionForm action={linkGuardian.bind(null, g.id)} submitLabel="Link" submitClass="btn-secondary btn-sm" successMessage="Linked.">
                  <div className="flex gap-2"><select name="student_id" aria-label="Child" className="input" required defaultValue="">{[<option key="" value="" disabled>Child</option>, ...studentOptions]}</select>
                    <input name="relationship" aria-label="Relationship" placeholder="Relationship" className="input w-32" /></div>
                </ActionForm>
              </Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}
    </>
  );
}
