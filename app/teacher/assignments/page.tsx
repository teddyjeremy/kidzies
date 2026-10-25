import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { createAssignment } from "@/app/actions/teacher";
import { ActionForm } from "@/components/forms/ActionForm";
import { A, Empty, PageHeader, Panel, Td, Th, TableWrap, formatDate } from "@/components/ui/ui";
import type { AssignmentRow, LessonRow, StudentListRow, TeacherOverview } from "@/types/api";

export const metadata = { title: "Assignments" };

export default async function TeacherAssignments({ searchParams }: { searchParams: Promise<{ lesson?: string; student?: string }> }) {
  const sp = await searchParams;
  const { token } = await requireRole(["teacher"]);
  const [overview, lessons, students] = await Promise.all([
    rpc<TeacherOverview>("api_teacher_overview", { p_token: token }),
    rpc<LessonRow[]>("api_lessons", { p_token: token }),
    rpc<StudentListRow[]>("api_teacher_students", { p_token: token, p_search: "" }),
  ]);
  const published = lessons.filter((l) => l.status === "published");
  const rows: AssignmentRow[] = overview.assignments;
  const defaultTarget = sp.student ? `student:${sp.student}` : overview.classes[0] ? `class:${overview.classes[0].id}` : "";
  return (
    <>
      <PageHeader title="Assignments" description="Assign published lessons to a whole class or to one student." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Panel title="Assign an activity">
          {published.length === 0 ? <Empty title="No published lessons" body="Publish a lesson first." /> : (
            <ActionForm action={createAssignment} submitLabel="Assign" successMessage="Assigned! Students can see it in their playground now.">
              <div className="space-y-3">
                <div><label className="label" htmlFor="lesson_id">Lesson</label>
                  <select id="lesson_id" name="lesson_id" className="input" defaultValue={sp.lesson ?? published[0]?.id}>
                    {published.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.area_name})</option>)}
                  </select></div>
                <div><label className="label" htmlFor="target">Assign to</label>
                  <select id="target" name="target" className="input" defaultValue={defaultTarget}>
                    <optgroup label="Whole class">{overview.classes.map((c) => <option key={c.id} value={`class:${c.id}`}>{c.name}</option>)}</optgroup>
                    <optgroup label="Individual student (or reassign)">{students.map((s) => <option key={s.id} value={`student:${s.id}`}>{s.first_name} {s.last_name}</option>)}</optgroup>
                  </select></div>
                <div><label className="label" htmlFor="due_at">Deadline (optional)</label><input id="due_at" name="due_at" type="date" className="input" /></div>
                <div><label className="label" htmlFor="note">Note for students (optional)</label><input id="note" name="note" className="input" maxLength={500} placeholder="Have fun!" /></div>
              </div>
            </ActionForm>
          )}
        </Panel>
        <Panel title="All assignments">
          {rows.length === 0 ? <Empty title="No assignments yet" /> : (
            <TableWrap>
              <thead><tr><Th>Lesson</Th><Th>Assigned to</Th><Th>Due</Th><Th>Completed</Th><Th /></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <Td><span className="font-bold">{a.title}</span><div className="text-xs text-ink-500">{a.area_name}</div></Td>
                    <Td>{a.target}</Td>
                    <Td>{formatDate(a.due_at)}</Td>
                    <Td>{a.completed}/{a.assigned}</Td>
                    <Td><A href={`/teacher/assignments/${a.id}`}>Submissions</A></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>
    </>
  );
}
