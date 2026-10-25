"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion, useWebGLSupport } from "@/lib/client/hooks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const HeroScene = dynamic(() => import("@/components/3d/HeroScene"), { ssr: false, loading: () => <HeroFallback /> });

function HeroFallback() {
  return (
    <div className="relative grid h-full place-items-center" aria-hidden="true">
      <span className="toy-tile absolute left-[12%] top-[20%] grid size-24 animate-float place-items-center font-display text-6xl font-bold" style={{ ["--tile" as string]: "#ff6f59" }}>A</span>
      <span className="toy-tile absolute right-[14%] top-[14%] grid size-20 animate-float place-items-center font-display text-5xl font-bold [animation-delay:1s]" style={{ ["--tile" as string]: "#2f9cf4" }}>B</span>
      <span className="toy-tile absolute bottom-[18%] left-[22%] grid size-16 animate-float place-items-center font-display text-4xl font-bold [animation-delay:2s]" style={{ ["--tile" as string]: "#1fbf85" }}>3</span>
      <span className="text-[9rem]">🧸</span>
    </div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-cream to-coral-50">
      <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-sun-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-lilac-300/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-mint-700 shadow-sm">
            Online kindergarten · ages 3–6
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Big Adventures.<br /><span className="text-coral-500">Little</span> <span className="text-sky-500">Learners.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700 sm:text-xl">
            Kidzies turns learning at home into a playful 3D toy world. Children explore letters, numbers, shapes, stories and
            kindness, while parents and teachers follow every step with clear, friendly progress reports.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#demo" className="btn btn-primary text-lg">Explore Kidzies</Link>
            <Link href="/how-it-works" className="btn btn-secondary text-lg">How It Works</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-700">
            <li>✓ Teacher-guided activities</li>
            <li>✓ No ads or trackers</li>
            <li>✓ Works on tablets &amp; laptops</li>
          </ul>
        </div>
        <div className="relative h-[360px] sm:h-[460px]">
          {webgl === "full" || webgl === "low" ? (
            <ErrorBoundary fallback={<HeroFallback />}><HeroScene reducedMotion={reduced} /></ErrorBoundary>
          ) : (
            <HeroFallback />
          )}
        </div>
      </div>
    </section>
  );
}
