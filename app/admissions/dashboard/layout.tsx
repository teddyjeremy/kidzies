import { requireRole } from "@/lib/auth/session";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata = { title: { default: "Admissions", template: "%s · Admissions · Kidzies" }, robots: { index: false } };

export default async function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["admissions", "admin"]);
  const nav = [{ href: "/admissions/dashboard", label: "Applications" }, { href: "/account", label: "Account" }];
  if (user.role === "admin") nav.push({ href: "/admin", label: "Back to admin" });
  return <PortalShell user={user} nav={nav} accent="#ff8a1f">{children}</PortalShell>;
}
