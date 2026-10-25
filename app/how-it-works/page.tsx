import Link from "next/link";
import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "How it works" };

const SECTIONS = [
  { t: "For children", e: "🧒", b: ["Sign in with the student code and password the school gives you, no email needed.", "Explore a 3D toy island: tap a place such as the ABC Garden or Number Playground.", "Play short activities with big buttons, spoken instructions and friendly sounds.", "Earn stars and stickers. Mistakes are fine: you can always try again."] },
  { t: "For parents", e: "👪", b: ["Get a parent login from the school when your child is enrolled.", "See only your own children: what they played, stars, strengths and what to practise.", "Read teacher feedback and school announcements.", "Apply for a place online and check the status with your reference number."] },
  { t: "For teachers", e: "🍎", b: ["See your classes, each child's progress and who needs support.", "Create lessons with simple question builders and preview them as a child would.", "Assign activities to a class or an individual child with a due date.", "Leave encouraging feedback, record attendance and add observations."] },
  { t: "For schools", e: "🏫", b: ["Administrators create student accounts and issue codes and passwords.", "Admissions staff review applications, ask for information and enrol accepted children.", "Every sensitive action is recorded in an audit log.", "Children never see adverts, chat with strangers or enter personal details."] },
];

export default function HowItWorks() {
  return (
    <PublicPage title="How Kidzies works" intro="One platform for playful learning at school and at home." wide>
      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <section key={s.t} className="card p-6">
            <h2 className="text-2xl font-bold"><span aria-hidden>{s.e}</span> {s.t}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-700">{s.b.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        ))}
      </div>
      <div className="mt-8 flex gap-3"><Link href="/login" className="btn btn-primary">Try the demo</Link><Link href="/admissions" className="btn btn-secondary">Admissions</Link></div>
    </PublicPage>
  );
}
