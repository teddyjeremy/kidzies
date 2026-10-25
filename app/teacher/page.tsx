import { isFuture } from "@/lib/time";
import Link from "next/link";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { A, Empty, PageHeader, Panel, Pct, Stars, Stat, Td, Th, TableWrap, formatDate, relative } from "@/components/ui/ui";
import type { TeacherOverview } from "@/types/api";

export default async function TeacherDashboard() {
  const { token } = await requireRole(["teacher"]);
  const o = await rpc<TeacherOverview>("api_teacher_overview", { p_token: token });
  const totals = o.assignments.reduce((acc, a) => ({ assigned: acc.assigned + a.assigned, done: acc.done + a.completed }), { assigned: 0, done: 0 });
  const completion = totals.assigned ? Math.round((totals.done / totals.assigned) * 100) : 0;
  const outstanding = o.assignments.filter((a) => a.completed < a.assigned);
  const upcoming = o.assignments.filter((a) => a.due_at && isFuture(a.due_at)).slice(0, 4);

  return (
    <>
      <PageHeader title={`Good day, ${o.teacher.name}`} description="Here is what is happening in your classes."
        actions={<><Link href="/teacher/lessons/new" className="btn btn-primary btn-sm">New lesson</Link><Link href="/teacher/assignments" className="btn btn-secondary btn-sm">Assign activity</Link></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Classes" value={o.classes.length} hint={o.classes.map((c) => c.name).join(", ")} />
        <Stat label="Students" value={o.total_students} color="#1fbf85" />
        <Stat label="Outstanding assignments" value={outstanding.length} color="#ff8a1f" />
        <Stat label="Completion rate" value={`${completion}%`} hint={`${totals.done} of ${totals.assigned} student tasks done`} color="#8a6cf0" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent activity" className="lg:col-span-2" action={<A href="/teacher/results">All results</A>}>
          {o.recent_activity.length === 0 ? <Empty title="No activity yet" body="Results appear here as soon as students finish an activity." /> : (
            <TableWrap>
              <thead><tr><Th>Student</Th><Th>Activity</Th><Th>Score</Th><Th>Stars</Th><Th>When</Th></tr></thead>
              <tbody>
                {o.recent_activity.map((r) => (
                  <tr key={r.attempt_id}>
                    <Td><A href={`/teacher/students/${r.student_id}`}>{r.student}</A></Td>
                    <Td>{r.lesson_title ?? r.area_name}<div className="text-xs text-ink-500">{r.area_name}</div></Td>
                    <Td><Pct score={r.score} max={r.max_score} /></Td>
                    <Td><Stars n={r.stars} /></Td>
                    <Td className="text-ink-500">{relative(r.completed_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
        <Panel title="May need support">
          {o.needs_support.length === 0 ? <Empty title="Everyone is on track" /> : (
            <ul className="space-y-3">
              {o.needs_support.map((s) => (
                <li key={s.student_id} className="rounded-2xl bg-coral-50 p-3">
                  <A href={`/teacher/students/${s.student_id}`}>{s.name}</A>
                  <p className="text-sm text-ink-700">{s.reason}{s.stats.recent_avg_pct !== null ? ` · recent average ${s.stats.recent_avg_pct}%` : ""}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Outstanding assignments" className="lg:col-span-2" action={<A href="/teacher/assignments">Manage</A>}>
          {outstanding.length === 0 ? <Empty title="Nothing outstanding" /> : (
            <ul className="divide-y divide-ink-900/5">
              {outstanding.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div><A href={`/teacher/assignments/${a.id}`}>{a.title}</A><p className="text-xs text-ink-500">{a.target} · {a.area_name} · due {formatDate(a.due_at)}</p></div>
                  <div className="w-40">
                    <div className="h-2 overflow-hidden rounded-full bg-ink-900/5"><div className="h-full bg-sky-500" style={{ width: `${(a.completed / Math.max(a.assigned, 1)) * 100}%` }} /></div>
                    <p className="mt-1 text-right text-xs text-ink-500">{a.completed}/{a.assigned} done</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Upcoming lessons">
          {upcoming.length === 0 ? <Empty title="No upcoming due dates" /> : (
            <ul className="space-y-2">
              {upcoming.map((a) => (
                <li key={a.id} className="rounded-xl bg-sky-100 p-3 text-sm"><strong>{formatDate(a.due_at)}</strong> · {a.title}</li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
