import Link from "next/link";
import { BarChart3, BookOpenCheck, ClipboardCheck, Home as HomeIcon, KeyRound, LayoutDashboard, MessageCircleHeart, School, Users } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/site/Hero";
import { DemoAccounts } from "@/components/site/DemoAccounts";
import { LEARNING_ADVENTURES } from "@/lib/learning/areas";

const STEPS = [
  { title: "Get a student account", body: "A parent receives a student account from the school, or applies through Admissions.", emoji: "📨" },
  { title: "Sign in with a code", body: "Your child signs in with their school-issued student code and password. No email needed.", emoji: "🔑" },
  { title: "Enter the playground", body: "A colourful 3D toy island opens, with a learning place for every subject.", emoji: "🏝️" },
  { title: "Play and learn", body: "Children complete lessons and games, earning stars and stickers as they go.", emoji: "⭐" },
  { title: "Follow progress", body: "Parents and teachers see results, feedback and next steps in their portals.", emoji: "📈" },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />

        <section aria-labelledby="areas-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 id="areas-title" className="text-4xl font-bold sm:text-5xl">Learning adventures</h2>
            <p className="mt-3 text-lg text-ink-700">Eight playful places on the Kidzies island, each designed around early-years learning goals.</p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_ADVENTURES.map((a) => (
              <li key={a.slug}>
                <Link href={`/learning/${a.slug}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1">
                  <span className="grid size-16 place-items-center rounded-3xl text-4xl shadow-toy transition group-hover:rotate-6" style={{ background: `${a.color}26` }} aria-hidden="true">{a.emoji}</span>
                  <h3 className="mt-4 text-2xl font-bold">{a.title}</h3>
                  <p className="mt-2 flex-1 text-ink-700">{a.description}</p>
                  <span className="mt-4 text-sm font-bold" style={{ color: a.color }}>
                    {a.status === "available" ? "See the adventure →" : "Coming soon · learn more →"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-title" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 id="how-title" className="text-center text-4xl font-bold sm:text-5xl">How Kidzies works</h2>
            <ol className="mt-12 grid gap-5 md:grid-cols-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative rounded-3xl bg-cream p-6">
                  <span className="absolute -top-4 left-6 grid size-9 place-items-center rounded-full bg-coral-500 font-display font-bold text-white shadow-toy">{i + 1}</span>
                  <p className="text-4xl" aria-hidden="true">{s.emoji}</p>
                  <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-700">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <Link href="/how-it-works" className="btn btn-secondary">Read the full guide</Link>
            </div>
          </div>
        </section>

        <DemoAccounts />

        <section id="parents" aria-labelledby="parents-title" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-mint-700">For parents</span>
              <h2 id="parents-title" className="mt-2 text-4xl font-bold sm:text-5xl">Learning at home, together</h2>
              <p className="mt-4 text-lg text-ink-700">
                Short, joyful sessions your child can do on a tablet or laptop, guided by their teacher. You see exactly what they
                practised, in plain language, with no confusing charts.
              </p>
              <Link href="/login?type=adult&id=parent%40demo.kidzies.local&demo=1" className="btn btn-mint mt-6">Try the parent portal</Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { Icon: HomeIcon, t: "At-home learning", b: "Ten-minute adventures that fit around family life." },
                { Icon: ClipboardCheck, t: "Teacher-assigned activities", b: "Your child sees exactly what their teacher has set." },
                { Icon: BarChart3, t: "Progress and feedback", b: "Weekly summaries built only from completed activities." },
                { Icon: MessageCircleHeart, t: "Parent involvement", b: "Teacher notes, announcements and easy contact links." },
              ].map(({ Icon, t, b }) => (
                <li key={t} className="card p-5">
                  <Icon className="text-mint-500" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-ink-700">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="schools" aria-labelledby="schools-title" className="scroll-mt-24 bg-ink-900 py-20 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <ul className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
              {[
                { Icon: School, t: "Teacher tools", b: "Create lessons from templates, assign them and review results." },
                { Icon: Users, t: "Admissions & enrolment", b: "Online applications, decisions and one-click enrolment." },
                { Icon: KeyRound, t: "Student login codes", b: "Unique, easy-to-type codes managed by school staff." },
                { Icon: LayoutDashboard, t: "School administration", b: "Classes, accounts, settings and a full audit log." },
              ].map(({ Icon, t, b }) => (
                <li key={t} className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <Icon className="text-sun-300" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-white/75">{b}</p>
                </li>
              ))}
            </ul>
            <div className="order-1 lg:order-2">
              <span className="text-sm font-bold uppercase tracking-wider text-sun-300">For schools</span>
              <h2 id="schools-title" className="mt-2 text-4xl font-bold sm:text-5xl">A complete kindergarten LMS</h2>
              <p className="mt-4 text-lg text-white/80">
                Kidzies gives teachers, admissions staff and administrators fast, professional dashboards, while children get a world
                built for them. Every action is permission-checked on the server and important changes are audit-logged.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login?type=adult&id=teacher%40demo.kidzies.local&demo=1" className="btn btn-sky">Try the teacher portal</Link>
                <Link href="/contact#schools" className="btn btn-secondary">School enquiries</Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="admit-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="card flex flex-col items-start gap-6 bg-gradient-to-r from-lilac-100 to-sky-100 p-8 sm:p-12 lg:flex-row lg:items-center">
            <BookOpenCheck size={56} className="text-lilac-500" aria-hidden="true" />
            <div className="flex-1">
              <h2 id="admit-title" className="text-3xl font-bold sm:text-4xl">Admissions are open</h2>
              <p className="mt-2 text-lg text-ink-700">Apply online in a few minutes and track your application with a reference number.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admissions/apply" className="btn btn-primary">Apply now</Link>
              <Link href="/admissions" className="btn btn-secondary">Programmes</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
