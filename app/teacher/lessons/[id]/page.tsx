import Link from "next/link";
import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { PageHeader, Panel, StatusBadge } from "@/components/ui/ui";
import { LessonForm } from "@/components/forms/LessonForm";
import type { LessonFull } from "@/types/api";
import type { LessonInput } from "@/lib/validation";

export default async function LessonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { token } = await requireRole(["teacher"]);
  let l: LessonFull;
  try {
    l = await rpc<LessonFull>("api_get_lesson", { p_token: token, p_lesson: id });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
  const initial: LessonInput & { id: string } = {
    id: l.id, title: l.title, subject: l.subject_slug as LessonInput["subject"], level: l.level, description: l.description,
    objectives: l.objectives, instructions: l.instructions, activity_type: l.activity_type, location: l.location, media_url: l.media_url ?? "",
    questions: l.questions.map((q) => ({ prompt: q.prompt, emoji: q.emoji ?? "", options: q.options ?? [], answer: q.answer ?? "", object: q.object ?? "", target: q.target ?? "" })),
    points_per_question: l.points_per_question, pass_mark: l.pass_mark, status: l.status,
  };
  return (
    <>
      <PageHeader title={l.title} description={`${l.area_name} · ${l.level}`}
        actions={<>
          <StatusBadge status={l.status} />
          <Link href={`/teacher/lessons/${l.id}/preview`} className="btn btn-secondary btn-sm">Preview as student</Link>
          {l.status === "published" && <Link href={`/teacher/assignments?lesson=${l.id}`} className="btn btn-primary btn-sm">Assign</Link>}
        </>} />
      {saved && <p role="status" className="mb-4 rounded-2xl bg-mint-100 p-3 font-semibold text-mint-700">Lesson saved.</p>}
      {l.mine ? <LessonForm initial={initial} /> : (
        <Panel title="School library lesson">
          <p className="text-ink-700">{l.description}</p>
          <p className="mt-2 text-sm text-ink-500">This lesson belongs to another teacher. You can preview and assign it, but not edit it.</p>
        </Panel>
      )}
    </>
  );
}
