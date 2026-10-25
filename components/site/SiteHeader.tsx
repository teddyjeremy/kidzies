"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/learning", label: "Learning Adventures" },
  { href: "/#parents", label: "For Parents" },
  { href: "/#schools", label: "For Schools" },
  { href: "/admissions", label: "Admissions" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-bold text-ink-700 hover:bg-white hover:text-ink-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/#demo" className="btn btn-primary btn-sm">Start Learning</Link>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink-900/5 bg-white px-4 pb-4 lg:hidden">
          <ul className="flex flex-col py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-bold text-ink-700 hover:bg-sky-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn-secondary flex-1">Sign In</Link>
            <Link href="/#demo" onClick={() => setOpen(false)} className="btn btn-primary flex-1">Start Learning</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
