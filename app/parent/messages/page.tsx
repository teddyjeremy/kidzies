import { requireRole } from "@/lib/auth/session";
import { getParentOverview } from "@/lib/db/parent";
import { Empty, PageHeader, Panel, formatDate } from "@/components/ui/ui";

export const metadata = { title: "Messages & news" };

export default async function ParentMessages() {
  const { token } = await requireRole(["parent"]);
  const o = await getParentOverview(token);
  const teachers = Array.from(new Map(o.children.flatMap((c) => c.classes.flatMap((k) => k.teachers)).map((t) => [t.email, t])).values());
  return (
    <>
      <PageHeader title="Messages & news" description="School announcements, notes from teachers, and how to get in touch." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Announcements" className="lg:col-span-2">
          {o.announcements.length === 0 ? <Empty title="No announcements" /> : (
            <ul className="space-y-3">{o.announcements.map((a) => <li key={a.title} className="rounded-2xl bg-cream p-4"><p className="font-bold">{a.title}</p><p className="text-ink-700">{a.body}</p><p className="mt-1 text-xs text-ink-500">{formatDate(a.published_at)}</p></li>)}</ul>
          )}
          <h3 className="mt-6 text-lg font-bold">Notes from teachers</h3>
          <ul className="mt-2 space-y-2">
            {o.children.flatMap((c) => c.observations.map((ob, i) => <li key={`${c.id}-${i}`} className="rounded-xl bg-lilac-100 p-3 text-sm"><strong>{c.first_name}:</strong> “{ob.note}” <span className="text-xs text-ink-500">· {ob.teacher}, {formatDate(ob.created_at)}</span></li>))}
          </ul>
        </Panel>
        <Panel title="Contact">
          <ul className="space-y-3 text-sm">
            {teachers.map((t) => <li key={t.email}><strong>{t.name}</strong><br /><a className="text-sky-700 underline" href={`mailto:${t.email}`}>{t.email}</a></li>)}
            <li><strong>School office</strong><br /><a className="text-sky-700 underline" href={`mailto:${o.school.contact_email}`}>{o.school.contact_email}</a></li>
          </ul>
          <p className="mt-4 text-xs text-ink-500">For children&apos;s safety Kidzies has no open chat. Families contact staff by email through the school.</p>
        </Panel>
      </div>
    </>
  );
}
