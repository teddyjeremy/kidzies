"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-6 text-center">
      <div>
        <p className="text-7xl" aria-hidden>🪁</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Something went a bit wobbly</h1>
        <p className="mt-2 text-ink-700">Please try again. If it keeps happening, sign out and back in.</p>
        <div className="mt-6 flex justify-center gap-3"><button className="btn btn-primary" onClick={reset}>Try again</button><Link href="/" className="btn btn-secondary">Home</Link></div>
      </div>
    </main>
  );
}
