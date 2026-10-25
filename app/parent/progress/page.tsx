import { notFound } from "next/navigation";
import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/db/errors";
import { getParentOverview } from "@/lib/db/parent";
import { ChildReport } from "@/components/portal/ChildReport";
import { Empty, PageHeader } from "@/components/ui/ui";
import type { ChildSummary } from "@/types";

export const metadata = { title: "Progress" };

export default async function ParentProgress({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const { child } = await searchParams;
  const { token } = await requireRole(["parent"]);
  let summary: ChildSummary | undefined;
  if (child) {
    if (!/^[0-9a-f-]{36}$/.test(child)) notFound();
    try {
      summary = await rpc<ChildSummary>("api_parent_child", { p_token: token, p_student: child });
    } catch (e) {
      if (e instanceof ForbiddenError) notFound();
      throw e;
    }
  } else {
    summary = (await getParentOverview(token)).children[0];
  }
  if (!summary) return <Empty title="No linked children" />;
  return (
    <>
      <PageHeader title={`${summary.first_name}'s learning`} description="Built only from activities your child has actually completed." />
      <ChildReport child={summary} />
    </>
  );
}
