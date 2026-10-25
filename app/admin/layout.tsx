import { requireRole } from "@/lib/auth/session";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata = { title: { default: "Administration", template: "%s · Admin · Kidzies" }, robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/guardians", label: "Parents & guardians" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit-logs", label: "Audit log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["admin"]);
  return <PortalShell user={user} nav={NAV} accent="#8a6cf0">{children}</PortalShell>;
}
