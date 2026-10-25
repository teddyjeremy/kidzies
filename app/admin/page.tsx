import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { A, PageHeader, Panel, Stat, formatDate, statusLabel } from "@/components/ui/ui";

interface Overview { students: number; guardians: number; teachers: number; classes: number; lessons: number; applications: Record<string, number>; attempts_week: number; avg_score_week: number | null; area_activity: { area_name: string; attempts: number; avg_pct: number }[]; recent_audit: { action: string; actor: string | null; target: string | null; created_at: string }[]; is_demo: boolean }

export default async function AdminHome() {
  const { token } = await requireRole(["admin"]);
  const o = await rpc<Overview>("api_admin_overview", { p_token: token });
  const pending = (o.applications.submitted ?? 0) + (o.applications.under_review ?? 0) + (o.applications.information_required ?? 0);
  return (
    <>
      <PageHeader title="School overview" description={o.is_demo ? "Demo administrator: you see and manage demo records only." : undefined} />
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Students" value={o.students} /><Stat label="Guardians" value={o.guardians} color="#1fbf85" />
        <Stat label="Teachers" value={o.teachers} color="#8a6cf0" /><Stat label="Classes" value={o.classes} color="#ff8a1f" />
        <Stat label="Lessons" value={o.lessons} color="#f5b700" /><Stat label="Open applications" value={pending} color="#ff5d73" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Learning this week" action={<A href="/admin/lessons">Lessons</A>}>
          <p className="mb-3 text-sm">{o.attempts_week} activities completed{o.avg_score_week != null && `, average score ${o.avg_score_week}%`}.</p>
          <ul className="space-y-2">{o.area_activity.map((a) => (
            <li key={a.area_name}><div className="flex justify-between text-sm"><span>{a.area_name}</span><span>{a.attempts} · {a.avg_pct}%</span></div>
              <div className="h-2 rounded-full bg-ink-900/5"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${a.avg_pct}%` }} /></div></li>
          ))}</ul>
        </Panel>
        <Panel title="Applications" action={<A href="/admissions/dashboard">Open admissions</A>}>
          <ul className="grid grid-cols-2 gap-2 text-sm">{Object.entries(o.applications).map(([s, n]) => <li key={s} className="rounded-xl bg-cream p-3"><strong>{n}</strong> {statusLabel(s)}</li>)}</ul>
        </Panel>
        <Panel title="Recent activity" action={<A href="/admin/audit-logs">Full audit log</A>} className="lg:col-span-2">
          <ul className="divide-y divide-ink-900/5 text-sm">{o.recent_audit.map((r, i) => <li key={i} className="flex justify-between py-2"><span><strong>{r.action}</strong> by {r.actor ?? "system"}</span><span className="text-ink-500">{formatDate(r.created_at, true)}</span></li>)}</ul>
        </Panel>
      </div>
    </>
  );
}
