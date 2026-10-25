import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { A, Empty, PageHeader, Panel } from "@/components/ui/ui";
import type { TeacherOverview } from "@/types/api";

export const metadata = { title: "Classes" };

export default async function TeacherClasses() {
  const { token } = await requireRole(["teacher"]);
  const o = await rpc<TeacherOverview>("api_teacher_overview", { p_token: token });
  return (
    <>
      <PageHeader title="My classes" description="Only classes you are assigned to are shown." />
      {o.classes.length === 0 ? <Empty title="No classes yet" body="An administrator can assign you to a class." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {o.classes.map((c) => (
            <Panel key={c.id}>
              <p className="text-sm font-bold text-ink-500">{c.level} · {c.school_year}</p>
              <h2 className="mt-1 text-2xl font-bold">{c.name}</h2>
              <p className="mt-1 text-ink-700">{c.student_count} students</p>
              <div className="mt-4"><A href={`/teacher/classes/${c.id}`}>Open class →</A></div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
