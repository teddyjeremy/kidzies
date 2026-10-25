"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Pin, Play, Sparkles, X } from "lucide-react";
import type { AreaKey, StudentHome } from "@/types";
import { AREAS, AREA_BY_KEY } from "@/lib/learning/areas";
import { nextUnlock, unlockedItems, UNLOCKABLES } from "@/lib/learning/scoring";
import { useReducedMotion, useWebGLSupport } from "@/lib/client/hooks";
import { useSound } from "@/lib/client/sound";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { HelpButton, LogoutButton, SoundToggle, StarCounter } from "@/components/playground/TopBar";

const PlaygroundScene = dynamic(() => import("@/components/3d/PlaygroundScene"), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  return (
    <div className="grid h-full place-items-center" role="status">
      <div className="text-center">
        <div className="mx-auto size-16 animate-bounce rounded-3xl bg-coral-500 shadow-toy" />
        <p className="mt-4 font-display text-2xl font-bold text-ink-700">Building your playground…</p>
      </div>
    </div>
  );
}

function FlatMap({ onSelect, completed }: { onSelect: (a: AreaKey) => void; completed: Partial<Record<AreaKey, number>> }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 p-4 pt-44 sm:grid-cols-3 sm:pt-40">
      {AREAS.map((a) => (
        <button key={a.key} type="button" onClick={() => onSelect(a.key)} className="toy-tile flex flex-col items-center gap-2 p-5 text-center" style={{ ["--tile" as string]: a.color }}>
          <span className="text-5xl" aria-hidden="true">{a.emoji}</span>
          <span className="font-display text-xl font-bold">{a.title}</span>
          {(completed[a.key] ?? 0) > 0 && <span aria-label="completed">⭐</span>}
        </button>
      ))}
    </div>
  );
}

export function PlaygroundHome({ home }: { home: StudentHome }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  const { speak, chime } = useSound();
  const [stickersOpen, setStickersOpen] = useState(false);
  const name = home.student.nickname || home.student.first_name;

  const completed = useMemo(() => {
    const out: Partial<Record<AreaKey, number>> = {};
    for (const [k, v] of Object.entries(home.progress)) out[k as AreaKey] = v?.completions ?? 0;
    return out;
  }, [home.progress]);
  const todo = home.assignments.filter((a) => !a.completed);
  const assignedAreas = todo.map((a) => a.area);
  const unlocked = unlockedItems(home.total_stars);
  const upcoming = nextUnlock(home.total_stars);
  const goalPct = Math.min(100, Math.round((home.today_count / home.daily_goal) * 100));
  const nextAreaKey = AREAS.find((a) => !completed[a.key])?.key ?? "abc-garden";
  const continueHref = todo[0] ? `/playground/lesson/${todo[0].id}` : `/playground/${nextAreaKey}`;

  const open = (area: AreaKey) => {
    chime("pop");
    speak(AREA_BY_KEY[area].title);
    router.push(`/playground/${area}`);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0" data-testid="playground-scene">
        {webgl === "none" ? (
          <FlatMap onSelect={open} completed={completed} />
        ) : webgl === "checking" ? (
          <SceneLoading />
        ) : (
          <ErrorBoundary fallback={<FlatMap onSelect={open} completed={completed} />}>
            <PlaygroundScene completed={completed} assigned={assignedAreas} unlocked={unlocked} reducedMotion={reduced} lowPower={webgl === "low"} onSelect={open} />
          </ErrorBoundary>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-3 sm:p-5">
        <section className="card pointer-events-auto flex max-w-md items-center gap-3 p-3 pr-5" aria-labelledby="welcome-title">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun-300 text-3xl shadow-toy" aria-hidden="true">🧸</span>
          <div>
            <h1 id="welcome-title" className="text-xl font-bold leading-tight sm:text-2xl">Welcome back, little explorer!</h1>
            <p className="text-ink-700">Hi <strong data-testid="student-name">{name}</strong>! Bobo the bear says: tap a place to play.</p>
          </div>
        </section>
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <StarCounter stars={home.total_stars} />
          <SoundToggle />
          <HelpButton />
          <LogoutButton />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <section className="card pointer-events-auto w-full p-4 lg:max-w-md" aria-labelledby="today-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="today-title" className="text-xl font-bold">Today&apos;s activities</h2>
              <span className="text-sm font-bold text-ink-500">Goal {Math.min(home.today_count, home.daily_goal)}/{home.daily_goal}</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-sky-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={goalPct} aria-label="Daily learning goal">
              <div className="h-full rounded-full bg-gradient-to-r from-mint-400 to-sky-400 transition-all" style={{ width: `${goalPct}%` }} />
            </div>
            <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto" data-testid="assignment-list">
              {todo.length === 0 && <li className="text-ink-700">No teacher activities right now. Explore any place on the island!</li>}
              {todo.map((a) => (
                <li key={a.id}>
                  <Link href={`/playground/lesson/${a.id}`} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2 font-bold hover:bg-sun-100">
                    <Pin size={18} className="text-coral-500" aria-hidden="true" />
                    <span className="flex-1">{a.title}</span>
                    <span className="text-xl" aria-hidden="true">{AREA_BY_KEY[a.area]?.emoji}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={continueHref} className="btn btn-primary flex-1" data-testid="continue-lesson">
                <Play size={20} aria-hidden="true" /> Continue
              </Link>
              <button type="button" onClick={() => setStickersOpen(true)} className="btn btn-secondary">
                <Award size={20} aria-hidden="true" /> Stickers
              </button>
            </div>
          </section>

          <nav aria-label="Learning places" className="pointer-events-auto">
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-end">
              {AREAS.map((a) => (
                <li key={a.key}>
                  <Link href={`/playground/${a.key}`} className="flex min-h-12 items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold shadow-soft hover:scale-105" style={{ color: a.color }} data-testid={`area-link-${a.key}`}>
                    <span aria-hidden="true">{a.emoji}</span> {a.title}
                    {(completed[a.key] ?? 0) > 0 && <span aria-label="played">⭐</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {stickersOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="stickers-title" className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4">
          <div className="card max-h-[90dvh] w-full max-w-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h2 id="stickers-title" className="text-3xl font-bold">My sticker book</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStickersOpen(false)} aria-label="Close sticker book"><X /></button>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {home.achievements.map((a) => (
                <li key={a.key} className={`rounded-2xl p-4 text-center ${a.earned ? "bg-sun-100" : "bg-ink-900/5 opacity-60"}`}>
                  <p className="text-4xl" aria-hidden="true">{a.earned ? "🏅" : "🔒"}</p>
                  <p className="font-display font-bold">{a.title}</p>
                  <p className="text-xs text-ink-700">{a.description}</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-xl font-bold"><Sparkles className="inline" size={20} aria-hidden="true" /> Playground surprises</h3>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {UNLOCKABLES.map((u) => (
                <li key={u.key} className={`rounded-xl p-3 text-center text-sm font-bold ${unlocked.includes(u.key) ? "bg-mint-100" : "bg-ink-900/5 text-ink-500"}`}>
                  {u.title}<br />{unlocked.includes(u.key) ? "Unlocked!" : `${u.stars} ⭐`}
                </li>
              ))}
            </ul>
            {upcoming && <p className="mt-3 text-ink-700">Collect {upcoming.stars - home.total_stars} more star(s) to unlock the {upcoming.title.toLowerCase()}!</p>}
            {home.feedback.length > 0 && (
              <>
                <h3 className="mt-6 text-xl font-bold">Notes from my teacher</h3>
                <ul className="mt-2 space-y-2">
                  {home.feedback.slice(0, 3).map((f, i) => (
                    <li key={i} className="rounded-xl bg-sky-100 p-3">💬 {f.feedback}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
