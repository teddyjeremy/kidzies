import { requireRole } from "@/lib/auth/session";
import { adminList } from "@/lib/db/admin";
import { SearchBox } from "@/components/portal/SearchBox";
import { Empty, PageHeader, TableWrap, Td, Th, formatDate } from "@/components/ui/ui";

export const metadata = { title: "Audit log" };

export default async function AuditLogs({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { token } = await requireRole(["admin"]);
  const rows = await adminList(token, "audit", q);
  return (
    <>
      <PageHeader title="Audit log" description="Sensitive actions: sign-ins, credential changes, admissions decisions and more. Latest 200." />
      <SearchBox q={q} placeholder="Search actions" />
      {rows.length === 0 ? <Empty title="Nothing logged yet" /> : (
        <TableWrap>
          <thead><tr><Th>When</Th><Th>Action</Th><Th>By</Th><Th>Target</Th><Th>Details</Th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}>
              <Td className="whitespace-nowrap">{formatDate(r.created_at, true)}</Td><Td><code>{r.action}</code></Td>
              <Td>{r.actor ?? "system"}{r.actor_role && <div className="text-xs text-ink-500">{r.actor_role}</div>}</Td>
              <Td className="text-xs">{r.target_type} {r.target_id}</Td>
              <Td className="max-w-xs truncate text-xs">{r.details ? JSON.stringify(r.details) : ""}</Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}
    </>
  );
}
