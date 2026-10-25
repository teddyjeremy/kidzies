"use client";

import Link from "next/link";
import { useState } from "react";
import { HelpCircle, Home, LogOut, Star, Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/lib/client/sound";
import { logout } from "@/app/actions/auth";

export function SoundToggle() {
  const { enabled, toggle, chime } = useSound();
  return (
    <button type="button" onClick={() => { if (!enabled) setTimeout(() => chime("click"), 0); toggle(); }} className="btn btn-secondary btn-sm !min-h-12 !px-4" aria-pressed={enabled} aria-label={enabled ? "Turn sound off" : "Turn sound on"}>
      {enabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
      <span className="hidden sm:inline">{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

export function LogoutButton() {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setConfirm(true)} className="btn btn-secondary btn-sm !min-h-12 !px-4" aria-label="Log out">
        <LogOut size={22} /> <span className="hidden sm:inline">Bye-bye</span>
      </button>
      {confirm && (
        <div role="dialog" aria-modal="true" aria-labelledby="bye-title" className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4">
          <div className="card max-w-sm p-6 text-center">
            <p className="text-5xl" aria-hidden="true">👋</p>
            <h2 id="bye-title" className="mt-2 text-2xl font-bold">Time to say bye-bye?</h2>
            <p className="mt-1 text-ink-700">Your stars are saved. See you next time!</p>
            <div className="mt-5 flex justify-center gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirm(false)}>Keep playing</button>
              <form action={logout}>
                <button type="submit" className="btn btn-primary">Log out</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm !min-h-12 !px-4" aria-label="Help for grown-ups">
        <HelpCircle size={22} /> <span className="hidden md:inline">Grown-ups</span>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="help-title" className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4">
          <div className="card max-w-md p-6">
            <h2 id="help-title" className="text-2xl font-bold">For parents and carers</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-700">
              <li>Tap or click a coloured area on the island to open a learning game. Drag to turn the island.</li>
              <li>Activities from the teacher are marked with a 📌 pin and listed under &quot;Today&apos;s activities&quot;.</li>
              <li>Progress is saved automatically and appears in the parent portal.</li>
              <li>Short sessions of 10–15 minutes work best for young children.</li>
              <li>Trouble signing in? Contact your child&apos;s teacher or the school office for a password reset.</li>
            </ul>
            <button type="button" className="btn btn-primary mt-5 w-full" onClick={() => setOpen(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

export function ActivityTopBar({ title, emoji, color }: { title: string; emoji: string; color: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-3 sm:px-6" style={{ background: `${color}22` }}>
      <Link href="/playground" className="btn btn-secondary btn-sm !min-h-12 !px-4" aria-label="Back to the playground">
        <Home size={22} /> <span className="hidden sm:inline">Playground</span>
      </Link>
      <h1 className="flex items-center gap-2 truncate text-xl font-bold sm:text-3xl" style={{ color }}>
        <span aria-hidden="true">{emoji}</span> {title}
      </h1>
      <SoundToggle />
    </header>
  );
}

export function StarCounter({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 font-display text-lg font-bold shadow-toy" data-testid="star-count">
      <Star className="fill-sun-400 text-sun-500" size={22} aria-hidden="true" /> {stars} <span className="sr-only">stars</span>
    </span>
  );
}
