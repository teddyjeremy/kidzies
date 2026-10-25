import Link from "next/link";
import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { LessonPreview } from "@/components/learning/LessonPreview";
import type { LessonFull } from "@/types/api";

export const metadata = { title: "Preview as student" };

export default async function LessonPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { token } = await requireRole(["teacher"]);
  let l: LessonFull;
  try {
    l = await rpc<LessonFull>("api_get_lesson", { p_token: token, p_lesson: id });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sun-100 p-4">
        <p className="font-semibold">Preview mode: this is how students see the lesson. Nothing you do here is saved or counted as a submission.</p>
        <Link href={`/teacher/lessons/${l.id}`} className="btn btn-secondary btn-sm">Exit preview</Link>
      </div>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 to-mint-100">
        <LessonPreview lesson={{ id: l.id, title: l.title, description: l.description, instructions: l.instructions, activity_type: l.activity_type, location: l.location, questions: l.questions, media_url: l.media_url }} exitHref={`/teacher/lessons/${l.id}`} />
      </div>
    </>
  );
}
