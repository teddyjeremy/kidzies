import Link from "next/link";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { A, Empty, PageHeader, Panel, StatusBadge, Td, Th, TableWrap, formatDate } from "@/components/ui/ui";
import type { LessonRow } from "@/types/api";

export const metadata = { title: "Lessons" };

export default async function TeacherLessons() {
  const { token } = await requireRole(["teacher"]);
  const lessons = await rpc<LessonRow[]>("api_lessons", { p_token: token });
  return (
    <>
      <PageHeader title="Lessons" description="Your lessons and the school's published library." actions={<Link href="/teacher/lessons/new" className="btn btn-primary btn-sm">New lesson</Link>} />
      <Panel>
        {lessons.length === 0 ? <Empty title="No lessons yet" action={<Link className="btn btn-primary btn-sm" href="/teacher/lessons/new">Create your first lesson</Link>} /> : (
          <TableWrap>
            <thead><tr><Th>Title</Th><Th>Type</Th><Th>Location</Th><Th>Level</Th><Th>Status</Th><Th>Assigned</Th><Th>Updated</Th><Th /></tr></thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id}>
                  <Td><A href={`/teacher/lessons/${l.id}`}>{l.title}</A><div className="text-xs text-ink-500">{l.subject}{!l.mine && l.author ? ` · by ${l.author}` : ""}</div></Td>
                  <Td>{l.activity_type.replace("_", " ")} · {l.question_count}q</Td>
                  <Td>{l.area_name}</Td>
                  <Td>{l.level}</Td>
                  <Td><StatusBadge status={l.status} /></Td>
                  <Td>{l.assignment_count}</Td>
                  <Td className="text-ink-500">{formatDate(l.updated_at)}</Td>
                  <Td><A href={`/teacher/lessons/${l.id}/preview`}>Preview</A></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  );
}
