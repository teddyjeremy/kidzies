import { Badge, Empty, Panel, Pct, Stars, StatusBadge, formatDate, relative } from "@/components/ui/ui";
import { strengthsAndPractice, weeklySummary } from "@/lib/learning/scoring";
import type { ChildSummary } from "@/types";

/** Shared learning summary for parents and teachers, built only from saved records. */
export function ChildReport({ child, feedbackSlot }: { child: ChildSummary; feedbackSlot?: (attemptId: string, existing: string | null) => React.ReactNode }) {
  const name = child.nickname || child.first_name;
  const { strengths, practice } = strengthsAndPractice(child.area_averages);
  const upcoming = child.assignments.filter((a) => !a.completed);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel className="lg:col-span-3 bg-gradient-to-r from-mint-100 to-sky-100">
        <p className="font-display text-2xl font-bold" data-testid="weekly-summary">{weeklySummary(name, child.week_count, child.week_areas)}</p>
        <p className="mt-2 text-ink-700">{child.total_attempts} activities completed in total · {child.total_stars} stars collected · {child.achievements.length} stickers earned</p>
      </Panel>
      <Panel title="Strengths">
        {strengths.length ? <ul className="flex flex-wrap gap-2">{strengths.map((s) => <li key={s}><Badge tone="green">{s}</Badge></li>)}</ul>
          : <p className="text-sm text-ink-500">Strengths appear after a few activities with high scores.</p>}
      </Panel>
      <Panel title="Suggested practice">
        {practice.length ? <ul className="flex flex-wrap gap-2">{practice.map((s) => <li key={s}><Badge tone="yellow">{s}</Badge></li>)}</ul>
          : <p className="text-sm text-ink-500">Nothing flagged. Keep exploring!</p>}
      </Panel>
      <Panel title="Stickers">
        {child.achievements.length ? <ul className="flex flex-wrap gap-2">{child.achievements.map((a) => <li key={a.key}><Badge tone="purple">🏅 {a.title}</Badge></li>)}</ul>
          : <p className="text-sm text-ink-500">No stickers yet.</p>}
      </Panel>
      <Panel title="Progress by learning area" className="lg:col-span-2">
        {child.progress.length === 0 ? <Empty title="No activities completed yet" body="Progress will appear once activities are finished." /> : (
          <ul className="space-y-3" data-testid="progress-list">
            {child.progress.map((p) => (
              <li key={p.area} className="flex items-center gap-3">
                <span className="w-40 shrink-0 font-bold">{p.area_name}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-900/5"><div className="h-full rounded-full bg-mint-500" style={{ width: `${p.best_score_pct}%` }} /></div>
                <span className="w-24 text-right text-sm"><Stars n={p.best_stars} /></span>
                <span className="hidden w-28 text-right text-xs text-ink-500 sm:block">{p.completions}× · {relative(p.last_played_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Upcoming assignments">
        {upcoming.length === 0 ? <p className="text-sm text-ink-500">All caught up.</p> : (
          <ul className="space-y-2">{upcoming.map((a) => <li key={a.id} className="rounded-xl bg-sun-100 p-3 text-sm"><strong>{a.title}</strong><br />{a.area_name} · due {formatDate(a.due_at)}{a.note && <><br /><em>“{a.note}”</em></>}</li>)}</ul>
        )}
      </Panel>
      <Panel title="Recent results and teacher feedback" className="lg:col-span-2">
        {child.recent_attempts.length === 0 ? <Empty title="No results yet" /> : (
          <ul className="divide-y divide-ink-900/5" data-testid="recent-results">
            {child.recent_attempts.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{r.lesson_title ?? r.area_name} <span className="text-xs font-normal text-ink-500">· {r.area_name}</span></span>
                  <span className="flex items-center gap-3 text-sm"><Pct score={r.score} max={r.max_score} /> <Stars n={r.stars} /> <span className="text-ink-500">{formatDate(r.completed_at, true)}</span></span>
                </div>
                {r.mistakes.length > 0 && <p className="mt-1 text-xs text-ink-500">Practise: {r.mistakes.join(" · ")}</p>}
                {r.feedback && <p className="mt-2 rounded-xl bg-sky-100 p-2 text-sm">💬 {r.feedback}</p>}
                {feedbackSlot?.(r.id, r.feedback)}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Attendance and notes">
        {child.attendance.length === 0 ? <p className="text-sm text-ink-500">No attendance recorded yet.</p> : (
          <ul className="mb-4 space-y-1 text-sm">{child.attendance.map((a) => <li key={a.day} className="flex justify-between"><span>{formatDate(a.day)}</span><StatusBadge status={a.status} /></li>)}</ul>
        )}
        {child.observations.map((o, i) => <p key={i} className="mt-2 rounded-xl bg-lilac-100 p-3 text-sm">“{o.note}” <span className="block text-xs text-ink-500">{o.teacher} · {formatDate(o.created_at)}{!o.shared && " · staff only"}</span></p>)}
      </Panel>
    </div>
  );
}
