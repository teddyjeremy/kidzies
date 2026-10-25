import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { A, Empty, PageHeader, Panel, Pct, Stars, Td, Th, TableWrap, formatDate } from "@/components/ui/ui";
import type { ActivityRow } from "@/types/api";

export const metadata = { title: "Results" };

export default async function TeacherResults() {
  const { token } = await requireRole(["teacher"]);
  const r = await rpc<{ results: ActivityRow[]; common_mistakes: { prompt: string; area_name: string; count: number }[] }>("api_teacher_results", { p_token: token });
  return (
    <>
      <PageHeader title="Assessment results" description="Every saved activity from students in your classes." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel>
          {r.results.length === 0 ? <Empty title="No results yet" /> : (
            <TableWrap>
              <thead><tr><Th>Student</Th><Th>Activity</Th><Th>Score</Th><Th>Stars</Th><Th>Feedback</Th><Th>When</Th></tr></thead>
              <tbody data-testid="results-table">
                {r.results.map((x) => (
                  <tr key={x.attempt_id}>
                    <Td><A href={`/teacher/students/${x.student_id}`}>{x.student}</A></Td>
                    <Td>{x.lesson_title ?? x.area_name}<div className="text-xs text-ink-500">{x.area_name}</div></Td>
                    <Td><Pct score={x.score} max={x.max_score} /></Td>
                    <Td><Stars n={x.stars} /></Td>
                    <Td className="max-w-56 text-xs">{x.feedback ?? <span className="text-ink-500">—</span>}</Td>
                    <Td className="text-ink-500">{formatDate(x.completed_at, true)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
        <Panel title="Common mistakes">
          {r.common_mistakes.length === 0 ? <Empty title="Nothing to flag" /> : (
            <ul className="space-y-2">{r.common_mistakes.map((m, i) => <li key={i} className="rounded-xl bg-coral-50 p-3 text-sm"><strong>{m.count}×</strong> {m.prompt}<div className="text-xs text-ink-500">{m.area_name}</div></li>)}</ul>
          )}
        </Panel>
      </div>
    </>
  );
}
