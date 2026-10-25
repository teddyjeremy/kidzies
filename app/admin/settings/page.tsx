import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { updateSettings } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/ActionForm";
import { PageHeader, Panel } from "@/components/ui/ui";

export const metadata = { title: "Settings" };

export default async function AdminSettings() {
  const { token } = await requireRole(["admin"]);
  const o = await rpc<{ settings: { school_name: string; contact_email: string; school_year: string; daily_goal: number; demo_mode: boolean }; is_demo: boolean }>("api_admin_overview", { p_token: token });
  const s = o.settings;
  return (
    <>
      <PageHeader title="School settings" />
      <Panel>
        {o.is_demo && <p className="mb-4 rounded-2xl bg-sun-100 p-3 text-sm">You are signed in as the demo administrator, so settings are read-only.</p>}
        <ActionForm action={updateSettings} submitLabel="Save settings" successMessage="Settings saved.">
          <fieldset disabled={o.is_demo} className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="school_name">School name</label><input id="school_name" name="school_name" className="input" defaultValue={s.school_name} /></div>
            <div><label className="label" htmlFor="contact_email">Contact email</label><input id="contact_email" type="email" name="contact_email" className="input" defaultValue={s.contact_email} /></div>
            <div><label className="label" htmlFor="school_year">School year</label><input id="school_year" name="school_year" className="input" defaultValue={s.school_year} /></div>
            <div><label className="label" htmlFor="daily_goal">Daily activity goal</label><input id="daily_goal" type="number" min={1} max={10} name="daily_goal" className="input" defaultValue={s.daily_goal} /></div>
          </fieldset>
        </ActionForm>
        <p className="mt-4 text-xs text-ink-500">Demo mode is {s.demo_mode ? "on" : "off"}. New records created while demo mode is on are marked as demonstration data.</p>
      </Panel>
    </>
  );
}
