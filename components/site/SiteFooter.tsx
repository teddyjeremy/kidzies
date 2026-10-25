import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  { title: "Kidzies", links: [{ href: "/about", label: "About Kidzies" }, { href: "/how-it-works", label: "How it works" }, { href: "/learning", label: "Learning Adventures" }] },
  { title: "Families", links: [{ href: "/#parents", label: "Parent information" }, { href: "/admissions", label: "Admissions" }, { href: "/admissions/status", label: "Check an application" }] },
  { title: "Schools", links: [{ href: "/#schools", label: "For schools" }, { href: "/contact#schools", label: "School enquiries" }, { href: "/contact", label: "Contact" }] },
  { title: "Legal", links: [{ href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms of Use" }, { href: "/accessibility", label: "Accessibility" }] },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink-900 text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed">
            Playful, teacher-guided kindergarten learning at home. No ads, no trackers and no selling of children&apos;s data.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">{col.title}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-sun-300">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs sm:px-6">
          © {new Date().getFullYear()} Kidzies. This is a demonstration deployment: all names, schools and records are fictional.
        </p>
      </div>
    </footer>
  );
}
