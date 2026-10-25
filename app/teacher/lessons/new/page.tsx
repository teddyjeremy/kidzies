import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/ui";
import { LessonForm } from "@/components/forms/LessonForm";

export const metadata = { title: "New lesson" };

export default async function NewLessonPage() {
  await requireRole(["teacher"]);
  return (
    <>
      <PageHeader title="Create a lesson" description="Pick a template, add your questions and publish it to assign to your class." />
      <LessonForm />
    </>
  );
}
