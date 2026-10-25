import Link from "next/link";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { Empty, PageHeader, Stat, StatusBadge, TableWrap, Td, Th, formatDate, statusLabel } from "@/components/ui/ui";

interface Row { id: string; reference: string; child: string; requested_level: string; guardian_name: string; status: string; submitted_at: string; documents: number }
const STATUSES = ["submitted", "under_review", "information_required", "accepted", "rejected", "enrolled"];

export default async function AdmissionsDashboard({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const { token } = await requireRole(["admissions", "admin"]);
  const st = STATUSES.includes(status) ? status : "";
  const data = await rpc<{ counts: Record<string, number>; applications: Row[] }>("api_admissions_list", { p_token: token, p_search: q.slice(0, 80), p_status: st });
  return (
    <>
      <PageHeader title="Applications" description="Review, decide and enrol new families." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((s) => <Stat key={s} label={statusLabel(s)} value={data.counts[s] ?? 0} />)}
      </div>
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search name, reference or email" aria-label="Search applications" className="input max-w-xs" />
        <select name="status" defaultValue={st} aria-label="Filter by status" className="input max-w-[14rem]">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <button className="btn btn-secondary">Filter</button>
      </form>
      {data.applications.length === 0 ? <Empty title="No applications match" /> : (
        <TableWrap>
          <thead><tr><Th>Reference</Th><Th>Child</Th><Th>Level</Th><Th>Guardian</Th><Th>Docs</Th><Th>Submitted</Th><Th>Status</Th></tr></thead>
          <tbody>
            {data.applications.map((a) => (
              <tr key={a.id}>
                <Td><Link className="font-mono font-bold text-sky-700 underline" href={`/admissions/dashboard/${a.id}`}>{a.reference}</Link></Td>
                <Td>{a.child}</Td><Td>{a.requested_level}</Td><Td>{a.guardian_name}</Td><Td>{a.documents}</Td>
                <Td>{formatDate(a.submitted_at)}</Td><Td><StatusBadge status={a.status} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
