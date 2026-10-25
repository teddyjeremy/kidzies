import { requireRole } from "@/lib/auth/session";
import { adminList } from "@/lib/db/admin";
import { createTeacher, setAccountStatus } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/ActionForm";
import { SearchBox } from "@/components/portal/SearchBox";
import { Badge, Empty, PageHeader, Panel, StatusBadge, TableWrap, Td, Th } from "@/components/ui/ui";

export const metadata = { title: "Teachers" };

export default async function AdminTeachers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { token } = await requireRole(["admin"]);
  const teachers = await adminList(token, "teachers", q);
  return (
    <>
      <PageHeader title="Teachers" />
      <Panel title="Add a teacher" className="mb-6">
        <ActionForm action={createTeacher} submitLabel="Create teacher" successMessage="Teacher created." reveal={[{ key: "initial_password", label: "Temporary password" }]} resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" className="input" required /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" required /></div>
          </div>
        </ActionForm>
      </Panel>
      <SearchBox q={q} placeholder="Search teachers" />
      {teachers.length === 0 ? <Empty title="No teachers found" /> : (
        <TableWrap>
          <thead><tr><Th>Name</Th><Th>Email</Th><Th>Classes</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{teachers.map((t) => (
            <tr key={t.id}>
              <Td><strong>{t.name}</strong></Td><Td>{t.email}</Td><Td>{t.classes.map((c) => c.name).join(", ") || "—"}</Td>
              <Td>{t.status ? <StatusBadge status={t.status} /> : "—"}</Td>
              <Td>{t.protected ? <Badge tone="yellow">Demo · protected</Badge> : t.account_id && (t.status === "suspended"
                ? <ActionForm action={setAccountStatus.bind(null, t.account_id, "active")} submitLabel="Reactivate" submitClass="btn-secondary btn-sm" successMessage="Reactivated." />
                : <ActionForm action={setAccountStatus.bind(null, t.account_id, "suspended")} submitLabel="Suspend" submitClass="btn-danger btn-sm" confirm="Suspend this teacher?" successMessage="Suspended." />)}</Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}
    </>
  );
}
