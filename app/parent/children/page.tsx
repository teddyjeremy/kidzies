import { requireRole } from "@/lib/auth/session";
import { getParentOverview } from "@/lib/db/parent";
import { A, Empty, PageHeader, Panel } from "@/components/ui/ui";

export const metadata = { title: "My children" };

export default async function ParentChildren() {
  const { token } = await requireRole(["parent"]);
  const o = await getParentOverview(token);
  return (
    <>
      <PageHeader title="My children" description="Only children linked to your account by the school are shown." />
      {o.children.length === 0 ? <Empty title="No linked children" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {o.children.map((c) => (
            <Panel key={c.id}>
              <h2 className="text-2xl font-bold">{c.first_name} {c.last_name}</h2>
              <p className="text-sm text-ink-500">{c.nickname && `Known as “${c.nickname}” · `}{c.level}</p>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-ink-500">Class and teachers</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {c.classes.map((k) => (
                  <li key={k.id}><strong>{k.name}</strong>: {k.teachers.map((t) => <a key={t.email} className="text-sky-700 underline" href={`mailto:${t.email}`}>{t.name}</a>)}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ink-700">Student sign-in codes are given to families by the school. Ask the school office if you need it re-issued or the password reset.</p>
              <div className="mt-4"><A href={`/parent/progress?child=${c.id}`}>View progress →</A></div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
