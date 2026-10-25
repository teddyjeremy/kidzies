import { requireRole } from "@/lib/auth/session";
import { getParentOverview } from "@/lib/db/parent";
import { weeklySummary } from "@/lib/learning/scoring";
import { A, Empty, PageHeader, Panel, Stat, formatDate } from "@/components/ui/ui";

export default async function ParentHome() {
  const { token } = await requireRole(["parent"]);
  const o = await getParentOverview(token);
  return (
    <>
      <PageHeader title={`Hello, ${o.guardian.name.split(" ")[0]}`} description={`${o.school.name} family portal`} />
      {o.children.length === 0 ? <Empty title="No children linked to your account yet" body="Please contact the school office to link your child." /> : (
        <div className="space-y-6">
          {o.children.map((c) => (
            <Panel key={c.id} className="bg-gradient-to-r from-mint-100 to-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold" data-testid="child-name">{c.first_name} {c.last_name}</h2>
                  <p className="text-sm text-ink-500">{c.level} · {c.classes.map((k) => k.name).join(", ")}</p>
                  <p className="mt-3 max-w-2xl font-display text-xl" data-testid="weekly-summary">{weeklySummary(c.nickname || c.first_name, c.week_count, c.week_areas)}</p>
                </div>
                <A href={`/parent/progress?child=${c.id}`}>See full progress →</A>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-4">
                <Stat label="This week" value={c.week_count} hint="activities" color="#1fbf85" />
                <Stat label="Stars" value={c.total_stars} color="#f5b700" />
                <Stat label="To do" value={c.assignments.filter((a) => !a.completed).length} hint="teacher activities" color="#ff8a1f" />
                <Stat label="Stickers" value={c.achievements.length} color="#8a6cf0" />
              </div>
              {c.recent_attempts.find((r) => r.feedback) && (
                <p className="mt-4 rounded-2xl bg-sky-100 p-3 text-sm">💬 <strong>Latest teacher feedback:</strong> {c.recent_attempts.find((r) => r.feedback)?.feedback}</p>
              )}
            </Panel>
          ))}
          <Panel title="School announcements">
            {o.announcements.length === 0 ? <p className="text-sm text-ink-500">No announcements.</p> : (
              <ul className="space-y-3">{o.announcements.slice(0, 3).map((a) => <li key={a.title} className="rounded-2xl bg-cream p-4"><p className="font-bold">{a.title}</p><p className="text-sm text-ink-700">{a.body}</p><p className="mt-1 text-xs text-ink-500">{formatDate(a.published_at)}</p></li>)}</ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
