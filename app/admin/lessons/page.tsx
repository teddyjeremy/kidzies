import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { setLessonStatus } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/ActionForm";
import { Empty, PageHeader, StatusBadge, TableWrap, Td, Th, formatDate } from "@/components/ui/ui";

export const metadata = { title: "Lessons" };
interface Lesson { id: string; title: string; subject: string; level: string; area_name: string; status: string; question_count: number; author: string | null; updated_at: string; assignment_count: number }

export default async function AdminLessons() {
  const { token } = await requireRole(["admin"]);
  const lessons = await rpc<Lesson[]>("api_lessons", { p_token: token });
  return (
    <>
      <PageHeader title="Lessons" description="Publish, unpublish or archive lessons created by teachers." />
      {lessons.length === 0 ? <Empty title="No lessons yet" /> : (
        <TableWrap>
          <thead><tr><Th>Lesson</Th><Th>Subject</Th><Th>Place</Th><Th>Author</Th><Th>Updated</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{lessons.map((l) => (
            <tr key={l.id}>
              <Td><strong>{l.title}</strong><div className="text-xs text-ink-500">{l.level} · {l.question_count} questions · {l.assignment_count} assignments</div></Td>
              <Td>{l.subject}</Td><Td>{l.area_name}</Td><Td>{l.author ?? "—"}</Td><Td>{formatDate(l.updated_at)}</Td><Td><StatusBadge status={l.status} /></Td>
              <Td><div className="flex gap-1">
                {l.status !== "published" && <ActionForm action={setLessonStatus.bind(null, l.id, "published")} submitLabel="Publish" submitClass="btn-secondary btn-sm" successMessage="Published." />}
                {l.status === "published" && <ActionForm action={setLessonStatus.bind(null, l.id, "draft")} submitLabel="Unpublish" submitClass="btn-secondary btn-sm" successMessage="Moved to draft." />}
                {l.status !== "archived" && <ActionForm action={setLessonStatus.bind(null, l.id, "archived")} submitLabel="Archive" submitClass="btn-danger btn-sm" confirm="Archive this lesson? Children will no longer see it." successMessage="Archived." />}
              </div></Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}
    </>
  );
}
