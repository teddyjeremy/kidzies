import Link from "next/link";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="6" width="56" height="54" rx="18" fill="#c23f2c" />
      <rect x="4" y="4" width="56" height="52" rx="18" fill="#ff6f59" />
      <path d="M22 16v28M22 31l14-15M27 27l12 17" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="47" cy="17" r="5" fill="#ffd23f" />
    </svg>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="Kidzies home">
      <LogoMark />
      <span className={`font-display text-2xl font-bold ${light ? "text-white" : "text-ink-900"}`}>
        Kid<span className="text-coral-500">z</span>ies
      </span>
    </Link>
  );
}
