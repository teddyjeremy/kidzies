import Link from "next/link";
import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "Admissions", description: "Apply for a place at a Kidzies school for Pre-K, KG1 or KG2." };

const STEPS = [
  ["Apply online", "Tell us about your child and upload optional documents such as a birth certificate."],
  ["We review", "The admissions team reviews your application and may ask for more information."],
  ["Decision", "You can check your status any time with your reference number and email."],
  ["Welcome!", "Once enrolled, the school gives you a parent login and your child's student code."],
];

export default function AdmissionsPage() {
  return (
    <PublicPage title="Admissions" intro="Places are available for children aged 2 to 7 in Pre-K, KG1 and KG2.">
      <ol className="grid gap-4 sm:grid-cols-2">
        {STEPS.map(([t, b], i) => (
          <li key={t} className="card p-5"><span className="text-sm font-bold text-sky-700">Step {i + 1}</span><h2 className="text-xl font-bold">{t}</h2><p className="text-ink-700">{b}</p></li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admissions/apply" className="btn btn-primary">Start an application</Link>
        <Link href="/admissions/status" className="btn btn-secondary">Check application status</Link>
      </div>
      <p className="mt-6 text-sm text-ink-500">Accepted documents: PDF, PNG or JPEG, up to 2 MB each, three files at most. Documents are only visible to admissions staff.</p>
    </PublicPage>
  );
}
