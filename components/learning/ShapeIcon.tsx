import type { ShapeKind } from "@/lib/learning/content";

export function ShapeIcon({ shape, color, size = 72 }: { shape: ShapeKind; color: string; size?: number }) {
  const common = { fill: color, stroke: "rgba(0,0,0,0.15)", strokeWidth: 4, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`shine-${shape}`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {shape === "circle" && <><circle cx="50" cy="50" r="40" {...common} /><circle cx="50" cy="50" r="40" fill={`url(#shine-${shape})`} /></>}
      {shape === "square" && <><rect x="12" y="12" width="76" height="76" rx="14" {...common} /><rect x="12" y="12" width="76" height="76" rx="14" fill={`url(#shine-${shape})`} /></>}
      {shape === "triangle" && <><path d="M50 10 L92 86 Q94 90 89 90 L11 90 Q6 90 8 86 Z" {...common} /><path d="M50 10 L92 86 Q94 90 89 90 L11 90 Q6 90 8 86 Z" fill={`url(#shine-${shape})`} /></>}
      {shape === "star" && <><path d="M50 8 L61 37 L92 38 L67 57 L76 88 L50 70 L24 88 L33 57 L8 38 L39 37 Z" {...common} /><path d="M50 8 L61 37 L92 38 L67 57 L76 88 L50 70 L24 88 L33 57 L8 38 L39 37 Z" fill={`url(#shine-${shape})`} /></>}
    </svg>
  );
}
