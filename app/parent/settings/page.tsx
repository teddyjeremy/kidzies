import { requireRole } from "@/lib/auth/session";
import { getParentOverview } from "@/lib/db/parent";
import { updatePhone } from "@/app/actions/parent";
import { ActionForm } from "@/components/forms/ActionForm";
import { PasswordForm } from "@/components/forms/PasswordForm";
import { PageHeader, Panel } from "@/components/ui/ui";

export const metadata = { title: "Settings" };

export default async function ParentSettings() {
  const { token, user } = await requireRole(["parent"]);
  const o = await getParentOverview(token);
  return (
    <>
      <PageHeader title="Account settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Contact details">
          <p className="text-sm text-ink-700">Email: <strong>{o.guardian.email}</strong> (contact the school to change it)</p>
          <ActionForm action={updatePhone} submitLabel="Save phone" successMessage="Phone number updated.">
            <label className="label mt-4" htmlFor="phone">Phone</label>
            <input id="phone" name="phone" className="input" defaultValue={o.guardian.phone ?? ""} />
          </ActionForm>
        </Panel>
        <Panel title="Password"><PasswordForm protectedAccount={user.is_protected} /></Panel>
      </div>
    </>
  );
}
