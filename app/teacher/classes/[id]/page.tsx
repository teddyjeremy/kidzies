import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { recordAttendance } from "@/app/actions/teacher";
import { ActionForm } from "@/components/forms/ActionForm";
import { A, Empty, PageHeader, Panel, StatusBadge, Td, Th, TableWrap, relative } from "@/components/ui/ui";
import type { ClassDetail } from "@/types/api";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { token } = await requireRole(["teacher"]);
  let c: ClassDetail;
  try {
    c = await rpc<ClassDetail>("api_teacher_class", { p_token: token, p_class: id });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader title={c.name} description={`${c.level} · ${c.school_year} · ${c.students.length} students`} />
      <Panel title="Students and today's attendance">
        {c.students.length === 0 ? <Empty title="No students in this class yet" /> : (
          <TableWrap>
            <thead><tr><Th>Student</Th><Th>Activities</Th><Th>Average</Th><Th>Last active</Th><Th>Attendance today</Th></tr></thead>
            <tbody>
              {c.students.map((s) => (
                <tr key={s.id}>
                  <Td><A href={`/teacher/students/${s.id}`}>{s.first_name} {s.last_name}</A>{s.nickname && <div className="text-xs text-ink-500">“{s.nickname}”</div>}</Td>
                  <Td>{s.stats.attempts}</Td>
                  <Td>{s.stats.avg_pct === null ? "—" : `${s.stats.avg_pct}%`}</Td>
                  <Td className="text-ink-500">{relative(s.stats.last_at)}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      {s.attendance_today && <StatusBadge status={s.attendance_today} />}
                      <ActionForm action={recordAttendance.bind(null, c.id, s.id)} submitLabel="Save" successMessage="Recorded" className="flex items-center gap-2" submitClass="btn-secondary">
                        <label className="sr-only" htmlFor={`att-${s.id}`}>Attendance for {s.first_name}</label>
                        <select id={`att-${s.id}`} name="status" defaultValue={s.attendance_today ?? "present"} className="input !min-h-9 !py-1 text-sm">
                          <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="excused">Excused</option>
                        </select>
                      </ActionForm>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  );
}
