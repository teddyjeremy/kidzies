import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "Terms of Use" };

export default function Terms() {
  return (
    <PublicPage title="Terms of Use" intro="Last updated October 2026.">
      <div className="space-y-4 text-ink-700">
        <p>Kidzies is provided to schools and the families they invite. Accounts are personal: please do not share student codes or passwords outside your family.</p>
        <p><strong>Admissions.</strong> Submitting an application does not guarantee a place. Information must be accurate. The school may request further documents before a decision.</p>
        <p><strong>Acceptable use.</strong> Do not attempt to access other people&apos;s accounts or data, or disrupt the service.</p>
        <p><strong>Demo.</strong> The public demo accounts are shared and reset periodically; do not enter real personal information while using them.</p>
      </div>
    </PublicPage>
  );
}
