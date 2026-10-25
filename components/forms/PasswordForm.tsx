import { ActionForm } from "@/components/forms/ActionForm";
import { changePasswordForm } from "@/app/actions/parent";

export function PasswordForm({ protectedAccount }: { protectedAccount: boolean }) {
  if (protectedAccount) {
    return <p className="rounded-2xl bg-sun-100 p-3 text-sm">This is a shared demo account, so its password cannot be changed.</p>;
  }
  return (
    <ActionForm action={changePasswordForm} submitLabel="Change password" successMessage="Password changed. Other devices were signed out." resetOnSuccess>
      <div className="space-y-3">
        <div><label className="label" htmlFor="current">Current password</label><input id="current" name="current" type="password" autoComplete="current-password" className="input" required /></div>
        <div><label className="label" htmlFor="next">New password (10+ characters)</label><input id="next" name="next" type="password" autoComplete="new-password" minLength={10} className="input" required /></div>
        <div><label className="label" htmlFor="confirm">Confirm new password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" className="input" required /></div>
      </div>
    </ActionForm>
  );
}
