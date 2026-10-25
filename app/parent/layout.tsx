import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = { title: { default: "Parent portal", template: "%s · Parent · Kidzies" }, robots: { index: false } };

const NAV = [
  { href: "/parent", label: "Overview" },
  { href: "/parent/children", label: "My children" },
  { href: "/parent/progress", label: "Progress" },
  { href: "/parent/assignments", label: "Assignments" },
  { href: "/parent/messages", label: "Messages & news" },
  { href: "/parent/settings", label: "Settings" },
];

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["parent"]);
  return <PortalShell user={user} nav={NAV} accent="#1fbf85">{children}</PortalShell>;
}
