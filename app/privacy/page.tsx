import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <PublicPage title="Privacy Policy" intro="Last updated October 2026.">
      <div className="space-y-4 text-ink-700">
        <p><strong>What we collect.</strong> For children: first and last name, optional nickname, date of birth, class and learning activity results. For parents and staff: name, email, phone and sign-in records. Admissions applications include the details and documents families provide.</p>
        <p><strong>Why.</strong> Only to run the school&apos;s learning programme, show progress to the child&apos;s own parents and teachers, and process admissions.</p>
        <p><strong>Who can see it.</strong> Parents see only their linked children. Teachers see only their classes. Admissions documents are visible only to admissions staff and administrators.</p>
        <p><strong>What we never do.</strong> No adverts, no selling data, no third-party tracking, no public profiles and no open chat for children.</p>
        <p><strong>Security.</strong> Passwords are stored as one-way hashes, sessions expire, and sensitive actions are audit logged.</p>
        <p><strong>Your rights.</strong> Ask the school to see, correct or delete your family&apos;s information.</p>
        <p className="text-sm">This demonstration site uses fictional demo data.</p>
      </div>
    </PublicPage>
  );
}
