import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { AREA_BY_KEY } from "@/lib/learning/areas";
import { ActivityTopBar } from "@/components/playground/TopBar";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import type { Lesson } from "@/types";

export default async function StudentLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { token } = await requireRole(["student"]);
  let data: { assignment_id: string; lesson: Lesson };
  try {
    data = await rpc("api_student_assignment", { p_token: token, p_assignment: id });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
  const area = AREA_BY_KEY[data.lesson.location];
  return (
    <>
      <ActivityTopBar title={data.lesson.title} emoji={area.emoji} color={area.color} />
      <LessonPlayer lesson={data.lesson} assignmentId={data.assignment_id} exitHref="/playground" />
    </>
  );
}
