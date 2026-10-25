"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem { href: string; label: string }

export function PortalNav({ items, accent }: { items: NavItem[]; accent: string }) {
  const pathname = usePathname();
  const active = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav aria-label="Portal" className="overflow-x-auto px-2 pb-3 lg:px-3 lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((i) => {
          const on = i.href === active;
          return (
            <li key={i.href}>
              <Link href={i.href} aria-current={on ? "page" : undefined}
                className={`block whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-bold transition ${on ? "text-white" : "text-ink-700 hover:bg-ink-900/5"}`}
                style={on ? { background: accent } : undefined}>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
