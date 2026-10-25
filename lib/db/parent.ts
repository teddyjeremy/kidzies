import "server-only";
import { rpc } from "@/lib/db/rpc";
import type { ChildSummary } from "@/types";

export interface ParentOverview {
  guardian: { name: string; email: string; phone: string | null };
  children: ChildSummary[];
  announcements: { title: string; body: string; published_at: string }[];
  school: { name: string; contact_email: string };
}

export function getParentOverview(token: string) {
  return rpc<ParentOverview>("api_parent_overview", { p_token: token });
}
