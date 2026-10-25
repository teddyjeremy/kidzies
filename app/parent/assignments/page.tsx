import { requireRole } from "@/lib/auth/session";
import { getParentOverview } from "@/lib/db/parent";
import { Badge, Empty, PageHeader, Panel, Stars, Td, Th, TableWrap, formatDate } from "@/components/ui/ui";

export const metadata = { title: "Assignments" };

export default async function ParentAssignments() {
  const { token } = await requireRole(["parent"]);
  const o = await getParentOverview(token);
  return (
    <>
      <PageHeader title="Assignments" description="Activities set by your child's teacher. They appear in the playground with a 📌 pin." />
      {o.children.map((c) => (
        <Panel key={c.id} title={c.first_name} className="mb-6">
          {c.assignments.length === 0 ? <Empty title="No assignments" /> : (
            <TableWrap>
              <thead><tr><Th>Activity</Th><Th>Area</Th><Th>Due</Th><Th>Status</Th><Th>Best</Th></tr></thead>
              <tbody>
                {c.assignments.map((a) => (
                  <tr key={a.id}>
                    <Td><strong>{a.title}</strong>{a.note && <div className="text-xs text-ink-500">“{a.note}”</div>}</Td>
                    <Td>{a.area_name}</Td>
                    <Td>{formatDate(a.due_at)}</Td>
                    <Td>{a.completed ? <Badge tone="green">Done</Badge> : <Badge tone="yellow">To do</Badge>}</Td>
                    <Td>{a.completed ? <Stars n={a.best_stars} /> : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      ))}
    </>
  );
}
