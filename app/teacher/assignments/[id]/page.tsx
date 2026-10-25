import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { createAssignment, giveFeedback } from "@/app/actions/teacher";
import { ActionForm } from "@/components/forms/ActionForm";
import { A, Badge, Empty, PageHeader, Panel, Pct, Stars, Td, Th, TableWrap, formatDate } from "@/components/ui/ui";
import type { AssignmentDetail } from "@/types/api";

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { token } = await requireRole(["teacher"]);
  let a: AssignmentDetail;
  try {
    a = await rpc<AssignmentDetail>("api_assignment_detail", { p_token: token, p_assignment: id });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
  const done = a.submissions.filter((s) => s.attempt).length;
  return (
    <>
      <PageHeader title={a.lesson.title} description={`${a.lesson.area_name} · due ${formatDate(a.due_at)} · ${done}/${a.submissions.length} completed`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel title="Submissions">
          <TableWrap>
            <thead><tr><Th>Student</Th><Th>Score</Th><Th>Stars</Th><Th>Completed</Th><Th>Feedback</Th><Th /></tr></thead>
            <tbody>
              {a.submissions.map((s) => (
                <tr key={s.student_id} data-testid="submission-row">
                  <Td><A href={`/teacher/students/${s.student_id}`}>{s.name}</A></Td>
                  <Td>{s.attempt ? <Pct score={s.attempt.score} max={s.attempt.max_score} /> : <Badge tone="yellow">Not yet</Badge>}</Td>
                  <Td>{s.attempt && <Stars n={s.attempt.stars} />}</Td>
                  <Td className="text-ink-500">{s.attempt ? formatDate(s.attempt.completed_at, true) : "—"}</Td>
                  <Td className="min-w-64">
                    {s.attempt ? (
                      <ActionForm action={giveFeedback.bind(null, s.attempt.id)} submitLabel="Save" successMessage="Saved" submitClass="btn-secondary">
                        <label className="sr-only" htmlFor={`fb-${s.attempt.id}`}>Feedback for {s.name}</label>
                        <textarea id={`fb-${s.attempt.id}`} name="feedback" rows={2} defaultValue={s.attempt.feedback ?? ""} className="input text-sm" placeholder="Encouraging feedback…" />
                      </ActionForm>
                    ) : "—"}
                  </Td>
                  <Td>
                    {s.attempt && (
                      <ActionForm action={async (form: FormData) => { "use server"; form.set("lesson_id", a.lesson.id); form.set("target", `student:${s.student_id}`); return createAssignment(form); }}
                        submitLabel="Reassign" successMessage="Reassigned" submitClass="btn-ghost" />
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
        <Panel title="Common mistakes">
          {a.common_mistakes.length === 0 ? <Empty title="No mistakes recorded" /> : (
            <ul className="space-y-2">{a.common_mistakes.map((m) => <li key={m.prompt} className="flex justify-between gap-2 rounded-xl bg-coral-50 p-3 text-sm"><span>{m.prompt}</span><strong>{m.count}×</strong></li>)}</ul>
          )}
        </Panel>
      </div>
    </>
  );
}
