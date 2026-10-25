import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { A, Empty, PageHeader, Panel, Td, Th, TableWrap, relative } from "@/components/ui/ui";
import type { StudentListRow } from "@/types/api";

export const metadata = { title: "Students" };

export default async function TeacherStudents({ searchParams }: { searchParams: Promise<{ q?: string; need?: string }> }) {
  const { q = "", need } = await searchParams;
  const { token } = await requireRole(["teacher"]);
  let rows = await rpc<StudentListRow[]>("api_teacher_students", { p_token: token, p_search: q.slice(0, 60) });
  if (need === "1") rows = rows.filter((r) => r.stats.recent_avg_pct === null || r.stats.recent_avg_pct < 60);
  return (
    <>
      <PageHeader title="Students" description="Students in the classes you teach." />
      <Panel>
        <form className="mb-4 flex flex-wrap items-end gap-3" role="search">
          <div className="min-w-56 flex-1">
            <label htmlFor="q" className="label">Search by name</label>
            <input id="q" name="q" defaultValue={q} className="input" placeholder="e.g. Amara" />
          </div>
          <label className="flex items-center gap-2 pb-3 text-sm font-bold"><input type="checkbox" name="need" value="1" defaultChecked={need === "1"} className="size-5" /> Needs support only</label>
          <button className="btn btn-secondary btn-sm mb-1" type="submit">Filter</button>
        </form>
        {rows.length === 0 ? <Empty title="No students match" /> : (
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Class</Th><Th>Activities</Th><Th>Average</Th><Th>Recent</Th><Th>Stars</Th><Th>Last active</Th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.id}-${s.class_id}`}>
                  <Td><A href={`/teacher/students/${s.id}`}>{s.first_name} {s.last_name}</A></Td>
                  <Td>{s.class}</Td>
                  <Td>{s.stats.attempts}</Td>
                  <Td>{s.stats.avg_pct ?? "—"}{s.stats.avg_pct !== null && "%"}</Td>
                  <Td className={s.stats.recent_avg_pct !== null && s.stats.recent_avg_pct < 60 ? "font-bold text-coral-700" : ""}>{s.stats.recent_avg_pct ?? "—"}{s.stats.recent_avg_pct !== null && "%"}</Td>
                  <Td>{s.stats.stars}</Td>
                  <Td className="text-ink-500">{relative(s.stats.last_at)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  );
}
