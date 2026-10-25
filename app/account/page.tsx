import { requireRole } from "@/lib/auth/session";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/auth/roles";
import { PortalShell } from "@/components/portal/PortalShell";
import { PasswordForm } from "@/components/forms/PasswordForm";
import { PageHeader, Panel } from "@/components/ui/ui";

export const metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const { user } = await requireRole(["parent", "teacher", "admin", "admissions"]);
  return (
    <PortalShell user={user} nav={[{ href: ROLE_HOME[user.role], label: "Back to dashboard" }, { href: "/account", label: "Account" }]} accent="#2f9cf4">
      <PageHeader title="Your account" description={`${user.display_name} · ${ROLE_LABEL[user.role]}`} />
      <Panel title="Change password"><PasswordForm protectedAccount={user.is_protected} /></Panel>
    </PortalShell>
  );
}
