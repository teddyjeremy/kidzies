import Link from "next/link";
import { GraduationCap, HeartHandshake, School, ShieldCheck, ClipboardList } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";

export const DEMO_PASSWORD = "KidziesDemo123!";

export const DEMO_ACCOUNTS = [
  { role: "Student", kind: "student", id: "QF5G7J90", idLabel: "Student code", cta: "Try as Student", color: "#ff6f59", Icon: GraduationCap,
    description: "Explore the 3D playground as Amara, play learning games and collect stars." },
  { role: "Parent / Guardian", kind: "adult", id: "parent@demo.kidzies.local", idLabel: "Email", cta: "Try as Parent", color: "#1fbf85", Icon: HeartHandshake,
    description: "See Amara's weekly progress, teacher feedback and upcoming activities." },
  { role: "Teacher", kind: "adult", id: "teacher@demo.kidzies.local", idLabel: "Email", cta: "Try as Teacher", color: "#2f9cf4", Icon: School,
    description: "Manage Sunflower Class, create lessons, assign activities and review results." },
  { role: "Administrator", kind: "adult", id: "admin@demo.kidzies.local", idLabel: "Email", cta: "Try as Admin", color: "#8a6cf0", Icon: ShieldCheck,
    description: "Manage students, guardians, teachers, classes, student codes and audit logs." },
  { role: "Admissions Officer", kind: "adult", id: "admissions@demo.kidzies.local", idLabel: "Email", cta: "Try as Admissions", color: "#ff8a1f", Icon: ClipboardList,
    description: "Review applications, request information, record decisions and enrol children." },
] as const;

export function DemoAccounts() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="scroll-mt-24 bg-gradient-to-b from-sun-100 to-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-coral-600 shadow-sm">
            Demonstration accounts · fictional data only
          </span>
          <h2 id="demo-title" className="mt-4 text-4xl font-bold sm:text-5xl">Try the Kidzies Demo</h2>
          <p className="mt-4 text-lg text-ink-700">
            Every role is ready to explore, with no sign-up needed. These are shared demo logins with limited permissions and
            fictional records. They never touch real student data.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.role} className="card flex flex-col overflow-hidden" data-testid={`demo-${a.kind === "student" ? "student" : a.id.split("@")[0]}`}>
              <div className="flex items-center gap-3 p-5 pb-3" style={{ background: `${a.color}14` }}>
                <span className="grid size-12 place-items-center rounded-2xl text-white shadow-toy" style={{ background: a.color }}>
                  <a.Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold">{a.role}</h3>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
                <p className="text-sm text-ink-700">{a.description}</p>
                <dl className="space-y-2 rounded-2xl bg-cream p-3 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{a.idLabel}</dt>
                    <dd className="flex items-center justify-between gap-2 font-mono font-bold break-all">
                      {a.id} <CopyButton value={a.id} label={`Copy ${a.idLabel.toLowerCase()}`} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Password</dt>
                    <dd className="flex items-center justify-between gap-2 font-mono font-bold">
                      {DEMO_PASSWORD} <CopyButton value={DEMO_PASSWORD} label="Copy password" />
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/login?type=${a.kind}&id=${encodeURIComponent(a.id)}&demo=1`}
                  className="btn btn-primary mt-auto w-full"
                  style={{ background: a.color, boxShadow: "0 5px 0 rgb(0 0 0 / 0.18)" }}
                >
                  {a.cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
