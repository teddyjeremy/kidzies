import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/app/actions/auth";
import { ROLE_LABEL } from "@/lib/auth/roles";
import type { CurrentUser } from "@/types";
import { PortalNav, type NavItem } from "@/components/portal/PortalNav";

export function PortalShell({ user, nav, accent, children }: { user: CurrentUser; nav: NavItem[]; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7fb] lg:flex-row">
      <aside className="border-b border-ink-900/5 bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <Logo href={nav[0]?.href ?? "/"} />
        </div>
        <PortalNav items={nav} accent={accent} />
        <div className="hidden border-t border-ink-900/5 p-4 lg:mt-auto lg:block">
          <AccountBlock user={user} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-ink-900/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 lg:justify-end">
          {user.is_demo && (
            <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold text-ink-700">Demo account · some actions are restricted</span>
          )}
          <div className="lg:hidden"><AccountBlock user={user} compact /></div>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function AccountBlock({ user, compact = false }: { user: CurrentUser; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "flex-col items-stretch"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-100 font-display font-bold text-sky-700" aria-hidden="true">
          {user.display_name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold" data-testid="account-name">{user.display_name}</p>
          <p className="truncate text-xs text-ink-500">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/account" className="btn btn-ghost btn-sm">Account</Link>
        <form action={logout}>
          <button type="submit" className="btn btn-ghost btn-sm" data-testid="logout"><LogOut size={16} aria-hidden="true" /> Sign out</button>
        </form>
      </div>
    </div>
  );
}
