import Link from "next/link";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-ink-700">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, color = "#2f9cf4" }: { label: string; value: React.ReactNode; hint?: string; color?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-bold text-ink-500">{label}</p>
      <p className="mt-1 font-display text-4xl font-bold" style={{ color }}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink-900/10 p-8 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      {body && <p className="mt-1 text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const BADGE: Record<string, string> = {
  green: "bg-mint-100 text-mint-700", blue: "bg-sky-100 text-sky-700", yellow: "bg-sun-100 text-ink-700",
  red: "bg-coral-100 text-coral-700", purple: "bg-lilac-100 text-lilac-700", grey: "bg-ink-900/5 text-ink-700",
};

export function Badge({ children, tone = "grey" }: { children: React.ReactNode; tone?: keyof typeof BADGE }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${BADGE[tone]}`}>{children}</span>;
}

export const STATUS_TONE: Record<string, keyof typeof BADGE> = {
  draft: "grey", submitted: "blue", under_review: "purple", information_required: "yellow", accepted: "green", rejected: "red", enrolled: "green",
  published: "green", archived: "grey", active: "green", suspended: "red", present: "green", absent: "red", late: "yellow", excused: "blue",
};

export function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "grey"}>{statusLabel(status)}</Badge>;
}

export function Stars({ n }: { n: number | null | undefined }) {
  const v = n ?? 0;
  return <span aria-label={`${v} of 3 stars`} className="whitespace-nowrap text-sun-500">{"★".repeat(v)}<span className="text-ink-300">{"★".repeat(Math.max(0, 3 - v))}</span></span>;
}

export function Pct({ score, max }: { score: number; max: number }) {
  const p = max > 0 ? Math.round((score / max) * 100) : 0;
  const tone = p >= 80 ? "text-mint-700" : p >= 60 ? "text-sky-700" : "text-coral-700";
  return <span className={`font-bold ${tone}`}>{score}/{max} <span className="text-xs">({p}%)</span></span>;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="-mx-5 overflow-x-auto px-5"><table className="w-full min-w-[600px] text-left text-sm">{children}</table></div>;
}

export function Th({ children }: { children?: React.ReactNode }) {
  return <th scope="col" className="border-b border-ink-900/10 py-2 pr-3 text-xs font-bold uppercase tracking-wide text-ink-500">{children}</th>;
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`border-b border-ink-900/5 py-3 pr-3 align-top ${className}`}>{children}</td>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="font-bold text-sky-700 hover:underline">{children}</Link>;
}

export function formatDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", withTime ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" });
}

export function relative(iso: string | null | undefined): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (Math.abs(m) < 60) return m <= 1 ? "just now" : `${m} min ago`;
  const h = Math.round(m / 60);
  if (Math.abs(h) < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
