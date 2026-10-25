import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <PublicPage title="Contact us">
      <div className="grid gap-5 sm:grid-cols-2">
        <section className="card p-6"><h2 className="text-xl font-bold">Families</h2><p className="mt-2 text-ink-700">Questions about your child&apos;s account or learning? Please contact your school office first; they can reset codes and passwords.</p></section>
        <section id="schools" className="card p-6"><h2 className="text-xl font-bold">Schools</h2><p className="mt-2 text-ink-700">Interested in Kidzies for your school? Email <a className="underline" href="mailto:hello@school.example">hello@school.example</a>.</p></section>
      </div>
    </PublicPage>
  );
}
